const controller = require('../src/controllers/compilerController');
const Report = require('../src/models/Report');

jest.mock('../src/models/Report');

describe('compilerController.run', () => {
  let req, res, next;

  beforeEach(() => {
    req = { body: { code: '' }, user: { id: 'u1' } };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn().mockReturnThis() };
    next = jest.fn();
    jest.clearAllMocks();
  });

  test('allows valid C program', async () => {
    req.body.code = '#include<stdio.h>\nint main(){printf("Hello");return 0;}';
    Report.create.mockResolvedValue({});

    await controller.run(req, res, next);

    expect(res.status).toHaveBeenCalledWith(200);
    const payload = res.json.mock.calls[0][0];
    expect(payload.deployment.decision).toBe('ALLOWED');
    expect(payload.compilation.status).toBe('success');
    expect(payload.semantic.errors).toBe(0);
    expect(payload.lexical.status).toBe('passed');
    expect(payload.syntax.status).toBe('passed');
  });

  test('blocks code with syntax error', async () => {
    req.body.code = '#include<stdio.h>\nint main(){printf("Hi")'; // missing brace
    Report.create.mockResolvedValue({});

    await controller.run(req, res, next);

    const payload = res.json.mock.calls[0][0];
    expect(payload.deployment.decision).toBe('BLOCKED');
    expect(payload.syntax.status).toBe('failed');
  });

  test('blocks code with semantic errors (duplicate var)', async () => {
    req.body.code = '#include<stdio.h>\nint main(){int a; int a;}';
    Report.create.mockResolvedValue({});

    await controller.run(req, res, next);
    const payload = res.json.mock.calls[0][0];
    expect(payload.semantic.errors).toBeGreaterThan(0);
    expect(payload.deployment.decision).toBe('BLOCKED');
  });
});
