import { ExecutionContext, createParamDecorator } from '@nestjs/common';

export const GetOauthScopeData = createParamDecorator(
	(data: string | undefined, ctx: ExecutionContext) => {
		const req = ctx.switchToHttp().getRequest();
		if (data) {
			return req.user.scope[data];
		}
		return req.user.scope;
	},
);
