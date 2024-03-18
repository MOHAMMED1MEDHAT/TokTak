import { ExecutionContext, createParamDecorator } from '@nestjs/common';

export const GetPayload = createParamDecorator(
	(data: string | undefined, ctx: ExecutionContext) => {
		const req = ctx.switchToHttp().getRequest();
		if (data) {
			return req.user.payload[data];
		}
		return req.user.payload;
	},
);
