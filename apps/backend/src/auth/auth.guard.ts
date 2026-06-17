import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';

import { Reflector } from '@nestjs/core';
import { clerkMiddleware, getAuth } from '@clerk/express';

import { IS_PUBLIC_KEY } from './public.decorator';

@Injectable()
export class ClerkAuthGuard implements CanActivate {

  constructor(
    private reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {

    // Allow public routes (webhooks etc.)
    const isPublic = this.reflector.getAllAndOverride<boolean>(
      IS_PUBLIC_KEY,
      [
        context.getHandler(),
        context.getClass(),
      ],
    );

    if (isPublic) {
      return true;
    }


    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();


    // Run Clerk middleware
    await new Promise<void>((resolve, reject) => {
  clerkMiddleware()(request, response, (err?: string | Error) => {
    if (err) {
      reject(err);
      return;
    }

    resolve();
  });
});


    const authState = getAuth(request);


    if (!authState || !authState.userId) {
      throw new UnauthorizedException(
        'Access Denied: Invalid or missing session token.'
      );
    }


    request.user = {
      userId: authState.userId,

      // Clerk organization = tenant
      tenantId: authState.orgId
        ? authState.orgId
        : `user_${authState.userId}`,
    };


    return true;
  }
}