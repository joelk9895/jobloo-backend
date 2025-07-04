import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UserResponseDto } from '../dto/user.dto';

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): UserResponseDto => {
    const request = ctx
      .switchToHttp()
      .getRequest<Request & { user: UserResponseDto }>();
    return request.user;
  },
);
