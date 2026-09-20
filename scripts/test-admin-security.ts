import { handleAdminAuthRequest } from '../server/adminAuthRouter';

interface MockResponse {
  statusCode: number;
  data: any;
  headers: Record<string, string>;
  status(code: number): MockResponse;
  json(body: any): MockResponse;
  setHeader(key: string, value: string): MockResponse;
}

function createMockRes(): MockResponse {
  const res: MockResponse = {
    statusCode: 200,
    data: null,
    headers: {},
    status(code: number) {
      this.statusCode = code;
      return this;
    },
    json(body: any) {
      this.data = body;
      return this;
    },
    setHeader(key: string, value: string) {
      this.headers[key] = value;
      return this;
    }
  };
  return res;
}

function createMockReq(method: string, url: string, body?: any, headers: Record<string, string> = {}): any {
  return {
    method,
    url,
    body: body || {},
    headers: {
      'content-type': 'application/json',
      'x-forwarded-for': '192.168.1.100',
      ...headers
    },
    socket: { remoteAddress: '192.168.1.100' }
  };
}

async function runSecurityTestSuite() {
  console.log('===============================================================');
  console.log('🔒 AURUM TERMINAL — ADMIN-ONLY MODULE SECURITY SUITE VERIFICATION');
  console.log('===============================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(title: string, condition: boolean, details?: string) {
    if (condition) {
      console.log(`✅ PASS: ${title}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${title}`);
      if (details) console.error(`   Details: ${details}`);
      failed++;
    }
  }

  // --- TEST 1: Unconfigured Password Handling ---
  delete process.env.AURUM_ADMIN_UNLOCK_PASSWORD;
  const res1 = createMockRes();
  const req1 = createMockReq('POST', '/api/auth/admin-unlock', { password: 'test', module: 'GANN_INTRADAY' });
  await handleAdminAuthRequest(req1, res1 as any);
  assert(
    'Test 1: Returns 503 NOT CONFIGURED when AURUM_ADMIN_UNLOCK_PASSWORD is empty',
    res1.statusCode === 503 && res1.data.code === 'NOT_CONFIGURED' && res1.data.error === 'ADMIN UNLOCK NOT CONFIGURED',
    `Status: ${res1.statusCode}, Code: ${res1.data?.code}`
  );

  // Configure server password for remaining tests
  process.env.AURUM_ADMIN_UNLOCK_PASSWORD = 'AurumSuperSecretPassword2026!';

  // --- TEST 2: Protected Endpoints Reject Unauthorized Access with 403 ---
  const protectedEndpoints = [
    '/api/admin/gann-data',
    '/api/admin/master-intelligence',
    '/api/admin/paper-trading',
    '/api/admin/validation-health',
    '/api/admin/ai-learning',
    '/api/admin/risk-management',
    '/api/admin/trade-history',
    '/api/admin/audit-logs'
  ];

  for (const endpoint of protectedEndpoints) {
    const res = createMockRes();
    const req = createMockReq('GET', endpoint);
    await handleAdminAuthRequest(req, res as any);
    assert(
      `Test 2: Protected endpoint ${endpoint} returns 403 Forbidden without credentials`,
      res.statusCode === 403 && res.data?.code === 'ADMIN_ACCESS_REQUIRED',
      `Status: ${res.statusCode}`
    );
  }

  // --- TEST 3: Invalid Password Rejection (401) ---
  const res3 = createMockRes();
  const req3 = createMockReq('POST', '/api/auth/admin-unlock', { password: 'WrongPassword!', module: 'GANN_INTRADAY', userId: 'user1' });
  await handleAdminAuthRequest(req3, res3 as any);
  assert(
    'Test 3: Returns 401 INVALID_PASSWORD on incorrect password',
    res3.statusCode === 401 && res3.data?.code === 'INVALID_PASSWORD' && res3.data?.attemptsRemaining === 4,
    `Status: ${res3.statusCode}, attemptsRemaining: ${res3.data?.attemptsRemaining}`
  );

  // --- TEST 4: Rate Limiting after 5 failed attempts (429) ---
  for (let i = 0; i < 4; i++) {
    const res = createMockRes();
    const req = createMockReq('POST', '/api/auth/admin-unlock', { password: 'WrongPassword!', module: 'GANN_INTRADAY' });
    await handleAdminAuthRequest(req, res as any);
  }
  // 6th attempt should be rate limited
  const resRateLimit = createMockRes();
  const reqRateLimit = createMockReq('POST', '/api/auth/admin-unlock', { password: 'WrongPassword!', module: 'GANN_INTRADAY' });
  await handleAdminAuthRequest(reqRateLimit, resRateLimit as any);
  assert(
    'Test 4: Returns 429 RATE_LIMITED after 5 failed attempts',
    resRateLimit.statusCode === 429 && resRateLimit.data?.code === 'RATE_LIMITED' && resRateLimit.data?.retryAfterSeconds > 0,
    `Status: ${resRateLimit.statusCode}, code: ${resRateLimit.data?.code}`
  );

  // --- TEST 5: Successful Unlock with Correct Password (from fresh IP) ---
  const resSuccess = createMockRes();
  const reqSuccess = createMockReq('POST', '/api/auth/admin-unlock', 
    { password: 'AurumSuperSecretPassword2026!', module: 'MASTER_INTELLIGENCE', userId: 'trader1' },
    { 'x-forwarded-for': '192.168.1.101' }
  );
  await handleAdminAuthRequest(reqSuccess, resSuccess as any);
  assert(
    'Test 5: Returns 200 AUTHORIZED, token and 30m duration on correct password',
    resSuccess.statusCode === 200 && resSuccess.data?.status === 'AUTHORIZED' && typeof resSuccess.data?.token === 'string' && resSuccess.data?.durationMinutes === 30,
    `Status: ${resSuccess.statusCode}, token: ${resSuccess.data?.token}`
  );

  const unlockToken = resSuccess.data?.token;

  // --- TEST 6: Temporary Unlock Token Permits Access to all 7 Protected Modules ---
  for (const endpoint of protectedEndpoints) {
    const res = createMockRes();
    const req = createMockReq('GET', endpoint, null, {
      'x-forwarded-for': '192.168.1.101',
      'authorization': `Bearer ${unlockToken}`
    });
    await handleAdminAuthRequest(req, res as any);
    assert(
      `Test 6: Protected endpoint ${endpoint} returns 200 OK with valid unlock token`,
      res.statusCode === 200 && res.data?.status === 'ok',
      `Status: ${res.statusCode}`
    );
  }

  // --- TEST 7: POST /api/auth/admin-verify Confirms Active Token ---
  const resVerify = createMockRes();
  const reqVerify = createMockReq('POST', '/api/auth/admin-verify', { token: unlockToken, role: 'USER' });
  await handleAdminAuthRequest(reqVerify, resVerify as any);
  assert(
    'Test 7: /api/auth/admin-verify returns authorized: true with remainingSeconds',
    resVerify.statusCode === 200 && resVerify.data?.authorized === true && resVerify.data?.remainingSeconds > 0,
    `Remaining seconds: ${resVerify.data?.remainingSeconds}`
  );

  // --- TEST 8: Direct Admin Role Header Access (ADMIN bypass) ---
  const resAdmin = createMockRes();
  const reqAdmin = createMockReq('GET', '/api/admin/risk-management', null, {
    'x-aurum-role': 'ADMIN'
  });
  await handleAdminAuthRequest(reqAdmin, resAdmin as any);
  assert(
    'Test 8: Admin role can access protected modules directly without unlock password',
    resAdmin.statusCode === 200 && resAdmin.data?.status === 'ok',
    `Status: ${resAdmin.statusCode}`
  );

  // --- TEST 9: Manual Lock / Logout Invalidates Token ---
  const resLock = createMockRes();
  const reqLock = createMockReq('POST', '/api/auth/admin-lock', { token: unlockToken });
  await handleAdminAuthRequest(reqLock, resLock as any);
  assert(
    'Test 9: /api/auth/admin-lock revokes temporary authorization token',
    resLock.statusCode === 200 && resLock.data?.status === 'LOCKED',
    `Status: ${resLock.statusCode}`
  );

  // Verify access is now rejected
  const resAfterLock = createMockRes();
  const reqAfterLock = createMockReq('GET', '/api/admin/paper-trading', null, {
    'authorization': `Bearer ${unlockToken}`
  });
  await handleAdminAuthRequest(reqAfterLock, resAfterLock as any);
  assert(
    'Test 10: Revoked token receives 403 Forbidden on subsequent requests',
    resAfterLock.statusCode === 403 && resAfterLock.data?.code === 'ADMIN_ACCESS_REQUIRED',
    `Status: ${resAfterLock.statusCode}`
  );

  // --- TEST 11: Audit Logs Verification ---
  const resLogs = createMockRes();
  const reqLogs = createMockReq('GET', '/api/admin/audit-logs', null, {
    'x-aurum-role': 'ADMIN'
  });
  await handleAdminAuthRequest(reqLogs, resLogs as any);
  const logs = resLogs.data?.logs || [];
  const hasUnlockSuccess = logs.some((l: any) => l.eventType === 'TEMPORARY_UNLOCK_SUCCESS');
  const hasUnlockFailed = logs.some((l: any) => l.eventType === 'TEMPORARY_UNLOCK_FAILED');
  const hasRateLimited = logs.some((l: any) => l.eventType === 'RATE_LIMIT_EXCEEDED');
  const hasRouteDenied = logs.some((l: any) => l.eventType === 'PROTECTED_ROUTE_DENIED');
  const noPlaintextPasswords = logs.every((l: any) => !JSON.stringify(l).includes('AurumSuperSecretPassword2026!'));

  assert(
    'Test 11: Audit log records TEMPORARY_UNLOCK_SUCCESS, TEMPORARY_UNLOCK_FAILED, RATE_LIMIT_EXCEEDED, PROTECTED_ROUTE_DENIED and never logs passwords',
    resLogs.statusCode === 200 && hasUnlockSuccess && hasUnlockFailed && hasRateLimited && hasRouteDenied && noPlaintextPasswords,
    `Total audit logs: ${logs.length}`
  );

  console.log('\n---------------------------------------------------------------');
  console.log(`TEST SUMMARY: ${passed} PASSED / ${failed} FAILED`);
  console.log('---------------------------------------------------------------');

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runSecurityTestSuite().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
