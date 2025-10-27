// Mock for cloudflare:workers module used in tests

export class DurableObject {
	ctx: any;
	env: any;

	constructor(state: any, env: any) {
		this.ctx = state;
		this.env = env;
	}
}
