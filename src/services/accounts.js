export const BASE_ACCOUNTS = [
	{
		id: 'activos-disponibles',
		label: 'Activos',
		shortLabel: 'Activos',
		description: 'Lo que tenés: efectivo, bancos o saldos disponibles.',
		categoryKey: 'activos',
		nature: 'debit',
		tone: '#0ea5e9',
		icon: '💼',
	},
	{
		id: 'pasivos-obligaciones',
		label: 'Pasivos',
		shortLabel: 'Pasivos',
		description: 'Lo que debés: créditos, obligaciones y compromisos.',
		categoryKey: 'pasivos',
		nature: 'credit',
		tone: '#f97316',
		icon: '📉',
	},
	{
		id: 'patrimonio-capital',
		label: 'Patrimonio',
		shortLabel: 'Patrimonio',
		description: 'Tu capital o aportes propios dentro del sistema.',
		categoryKey: 'patrimonio',
		nature: 'credit',
		tone: '#6366f1',
		icon: '🏛️',
	},
	{
		id: 'ingresos-operativos',
		label: 'Ingresos',
		shortLabel: 'Ingresos',
		description: 'Lo que ganás por ventas, servicios u otras fuentes.',
		categoryKey: 'ingresos',
		nature: 'credit',
		tone: '#10b981',
		icon: '📈',
	},
	{
		id: 'gastos-operativos',
		label: 'Gastos',
		shortLabel: 'Gastos',
		description: 'Lo que gastás en operaciones, servicios o compras.',
		categoryKey: 'gastos',
		nature: 'debit',
		tone: '#ef4444',
		icon: '🧾',
	},
	{
		id: 'inversion-capital',
		label: 'Inversiones · Capital',
		shortLabel: 'Inv. capital',
		description: 'Capital invertido activo en compras o proyectos.',
		categoryKey: 'activos',
		parent: 'activos-disponibles',
		nature: 'debit',
		tone: '#0f766e',
		icon: '💎',
	},
	{
		id: 'inversion-ganancias',
		label: 'Inversiones · Ganancias',
		shortLabel: 'Inv. ganancia',
		description: 'Ganancia obtenida de las inversiones realizadas.',
		categoryKey: 'ingresos',
		parent: 'ingresos-operativos',
		nature: 'credit',
		tone: '#c026d3',
		icon: '💰',
	},
];

export const ACCOUNT_FLOW_RULES = {
	ingreso: {
		from: ['ingresos-operativos'],
		to: ['activos-disponibles', 'patrimonio-capital'],
		message: 'Los ingresos deben ir de Ingresos hacia Activos o Patrimonio.',
	},
	egreso: {
		from: ['activos-disponibles', 'patrimonio-capital'],
		to: ['gastos-operativos', 'pasivos-obligaciones'],
		message: 'Los egresos salen de Activos/Patrimonio hacia Gastos o Pasivos.',
	},
	investmentCapital: {
		from: ['activos-disponibles'],
		to: ['inversion-capital'],
		message: 'El capital invertido debe salir de Activos hacia Inversiones · Capital.',
	},
	investmentProfit: {
		from: ['inversion-capital'],
		to: ['inversion-ganancias', 'ingresos-operativos'],
		message: 'La ganancia de inversión debe salir de Inv. Capital hacia Ganancias.',
	},
};

export const TRANSACTION_ACCOUNT_DEFAULTS = {
	ingreso: {
		from: 'ingresos-operativos',
		to: 'activos-disponibles',
	},
	egreso: {
		from: 'activos-disponibles',
		to: 'gastos-operativos',
	},
};

const accountLookup = BASE_ACCOUNTS.reduce((acc, account) => {
	acc[account.id] = account;
	return acc;
}, {});

const targetMatchesAccount = (account, targets = []) => {
	if (!account) return false;
	return targets.some((target) => target === account.id || target === account.categoryKey);
};

export const getAccountById = (accountId) => accountLookup[accountId];

export const getAllowedAccounts = (movementType, direction = 'from') => {
	const rule = ACCOUNT_FLOW_RULES[movementType];
	if (!rule || !rule[direction]) {
		return BASE_ACCOUNTS;
	}

	return BASE_ACCOUNTS.filter((account) => targetMatchesAccount(account, rule[direction]));
};

export const validateAccountFlow = ({
	movementType,
	fromAccountId,
	toAccountId,
	amount,
}) => {
	const amountValue = Number(amount);
	if (!fromAccountId || !toAccountId) {
		return {
			valid: false,
			message: 'Selecciona las cuentas de origen y destino para la operación.',
		};
	}

	if (fromAccountId === toAccountId) {
		return {
			valid: false,
			message: 'Las cuentas de origen y destino no pueden ser la misma.',
		};
	}

	if (!amountValue || amountValue <= 0) {
		return {
			valid: false,
			message: 'El monto debe ser mayor que cero para registrar el movimiento.',
		};
	}

	const fromAccount = getAccountById(fromAccountId);
	const toAccount = getAccountById(toAccountId);
	if (!fromAccount || !toAccount) {
		return {
			valid: false,
			message: 'Las cuentas seleccionadas no son válidas dentro del plan contable.',
		};
	}

	const rule = ACCOUNT_FLOW_RULES[movementType];
	if (rule) {
		const fromAllowed = targetMatchesAccount(fromAccount, rule.from);
		const toAllowed = targetMatchesAccount(toAccount, rule.to);

		if (!fromAllowed || !toAllowed) {
			return {
				valid: false,
				message: rule.message,
			};
		}
	}

	return { valid: true };
};

const createLedgerAccount = (account) => ({
	id: account.id,
	label: account.label,
	shortLabel: account.shortLabel,
	categoryKey: account.categoryKey,
	description: account.description,
	nature: account.nature || 'debit',
	tone: account.tone,
	icon: account.icon,
	balance: 0,
	inflows: 0,
	outflows: 0,
});

const applyMovement = (ledger, fromAccountId, toAccountId, amount) => {
	const value = Number(amount) || 0;
	if (value <= 0) return;

	const fromAccount = getAccountById(fromAccountId);
	const toAccount = getAccountById(toAccountId);

	if (!fromAccount || !toAccount) {
		return;
	}

	if (!ledger[fromAccount.id]) {
		ledger[fromAccount.id] = createLedgerAccount(fromAccount);
	}

	if (!ledger[toAccount.id]) {
		ledger[toAccount.id] = createLedgerAccount(toAccount);
	}

	const getBalanceDelta = (account, direction) => {
		const nature = account.nature || 'debit';
		if (nature === 'debit') {
			return direction === 'inflow' ? value : -value;
		}
		return direction === 'inflow' ? -value : value;
	};

	ledger[fromAccount.id].balance += getBalanceDelta(fromAccount, 'outflow');
	ledger[fromAccount.id].outflows += value;

	ledger[toAccount.id].balance += getBalanceDelta(toAccount, 'inflow');
	ledger[toAccount.id].inflows += value;
};

export const summarizeAccountBalances = ({
	transactions = [],
	purchases = [],
	credits = [],
} = {}) => {
	const ledger = {};
	const warnings = [];

	const ensureAccountRegistered = (accountId) => {
		const definition = getAccountById(accountId);
		if (definition && !ledger[accountId]) {
			ledger[accountId] = createLedgerAccount(definition);
		}
	};

	BASE_ACCOUNTS.forEach((account) => {
		ensureAccountRegistered(account.id);
	});

	transactions.forEach((transaction) => {
		const absoluteAmount = Math.abs(Number(transaction.amount)) || 0;
		if (absoluteAmount <= 0) {
			warnings.push({
				type: 'transaction',
				id: transaction.id,
				message: `La transacción "${transaction.description}" no tiene un monto válido para contabilizar.`,
			});
			return;
		}

		let fromAccountId = transaction.fromAccountId;
		let toAccountId = transaction.toAccountId;
		let usedFallback = false;

		if (!fromAccountId || !toAccountId) {
			const defaults = TRANSACTION_ACCOUNT_DEFAULTS[transaction.type];
			fromAccountId = fromAccountId || defaults?.from;
			toAccountId = toAccountId || defaults?.to;
			usedFallback = true;
		}

		if (!fromAccountId || !toAccountId) {
			warnings.push({
				type: 'transaction',
				id: transaction.id,
				message: `La transacción "${transaction.description}" no pudo asignarse a cuentas contables.`,
			});
			return;
		}

		applyMovement(ledger, fromAccountId, toAccountId, absoluteAmount);

		if (usedFallback) {
			warnings.push({
				type: 'transaction',
				id: transaction.id,
				message: `La transacción "${transaction.description}" se asignó con la configuración automática de cuentas.`,
			});
		}
	});

	let investmentProfitTotal = 0;

	purchases.forEach((purchase) => {
		const capital = Number(purchase.investment) || 0;
		const salePrice = Number(purchase.salePrice) || 0;
		if (capital > 0) {
			applyMovement(ledger, 'activos-disponibles', 'inversion-capital', capital);
		}

		const profit = salePrice - capital;
		if (profit > 0) {
			investmentProfitTotal += profit;
		}
	});

	credits.forEach((credit) => {
		const principal = Number(credit.principalAmount) || 0;
		if (principal > 0) {
			applyMovement(ledger, 'activos-disponibles', 'pasivos-obligaciones', principal);
		}

		const totalPaid = Number(credit.totalPaid) || 0;
		const principalRepaid = Math.min(totalPaid, principal);
		if (principalRepaid > 0) {
			applyMovement(ledger, 'pasivos-obligaciones', 'activos-disponibles', principalRepaid);
		}

		const interestAmount = Number(credit.interestAmount) || 0;
		const interestRecognized = Boolean(
			credit.interestTransactionId ||
			credit.interestRouteVersion ||
			(credit.status === 'completed' && interestAmount > 0)
		);
		if (interestAmount > 0 && interestRecognized) {
			investmentProfitTotal += interestAmount;
		}
	});

	const orderedAccounts = BASE_ACCOUNTS.map((account) => {
		const ledgerAccount = ledger[account.id];
		if (!ledgerAccount) {
			return createLedgerAccount(account);
		}

		return ledgerAccount;
	});

	const totals = orderedAccounts.reduce(
		(acc, account) => {
			if (account.nature === 'credit') {
				acc.credits += account.balance;
			} else {
				acc.debits += account.balance;
			}
			acc.net += account.balance;
			return acc;
		},
		{ debits: 0, credits: 0, net: 0 }
	);

	return {
		accounts: orderedAccounts,
		totals,
		warnings,
		investmentProfitTotal,
	};
};
