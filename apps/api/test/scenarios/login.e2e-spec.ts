/**
 * 시나리오 e2e: 로그인 플로우
 * - DB: 인메모리 SQLite (E2E_USE_SQLITE)
 * - Mail, ObjectStorage, Stt, Llm: 모킹
 * - 시나리오: 유저 시드 → POST /api/users/login → GET /api/users/me (Bearer)
 */

import { INestApplication } from '@nestjs/common';
import { DataSource } from 'typeorm';
import request from 'supertest';
import { App } from 'supertest/types';
import { createE2eApp } from '../create-e2e-app';
import { User } from '../../src/user/entities/user.entity';
import { UserRole } from '../../src/user/entities/user-role.enum';
import { hashPassword } from '../../src/user/utils/password.util';
import type { LoginResponseDto } from '../../src/user/dtos/response/login.response.dto';

describe('시나리오 e2e: 로그인', () => {
  let app: INestApplication<App>;
  const testEmail = 'e2e-login@example.com';
  const testPassword = 'e2e-password-123';

  beforeAll(async () => {
    app = await createE2eApp();

    const dataSource = app.get(DataSource);
    const userRepo = dataSource.getRepository(User);
    // 같은 이메일을 가진 유저가 이미 있을 수 있으므로 깨끗이 정리
    await userRepo.delete({ email: testEmail });

    await userRepo.save(
      userRepo.create({
        email: testEmail,
        nickname: 'e2e-user',
        password: hashPassword(testPassword),
        role: UserRole.USER,
        totalPoint: 0,
        totalScore: 0,
      }),
    );
  });

  afterAll(async () => {
    await app.close();
  });

  it('POST /api/users/login → 200, accessToken·user 반환', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/users/login')
      .send({ email: testEmail, password: testPassword })
      .expect(200);

    const body = res.body as LoginResponseDto;

    expect(body).toHaveProperty('accessToken');
    expect(typeof body.accessToken).toBe('string');
    expect(body.accessToken.length).toBeGreaterThan(0);
    expect(body).toHaveProperty('user');
    expect(typeof body.user.id).toBe('number');
    expect(body.user.nickname).toBe('e2e-user');
  });

  it('로그인 후 GET /api/users/me (Bearer) → 200, 유저 정보 반환', async () => {
    const loginRes = await request(app.getHttpServer())
      .post('/api/users/login')
      .send({ email: testEmail, password: testPassword })
      .expect(200);

    const loginBody = loginRes.body as LoginResponseDto;
    const accessToken = loginBody.accessToken;

    const meRes = await request(app.getHttpServer())
      .get('/api/users/me')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(meRes.body).toHaveProperty('id');
    expect(meRes.body).toHaveProperty('email', testEmail);
    expect(meRes.body).toHaveProperty('nickname', 'e2e-user');
  });

  it('잘못된 비밀번호로 로그인 → 401', async () => {
    await request(app.getHttpServer())
      .post('/api/users/login')
      .send({ email: testEmail, password: 'wrong-password' })
      .expect(401);
  });

  it('존재하지 않는 이메일로 로그인 → 404', async () => {
    await request(app.getHttpServer())
      .post('/api/users/login')
      .send({ email: 'nonexistent@example.com', password: testPassword })
      .expect(404);
  });
});
