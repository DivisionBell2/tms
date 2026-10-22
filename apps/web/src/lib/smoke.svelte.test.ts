import { describe, expect, it } from 'vitest';

describe('руны в тестах', () => {
	it('$state и $derived работают вне компонента', () => {
		let count = $state(1);
		const double = $derived(count * 2);

		expect(double).toBe(2);

		count = 5;

		expect(double).toBe(10);
	});
});
