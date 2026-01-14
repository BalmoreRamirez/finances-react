export const BASE_ACCOUNTS = [
	{
		id: 'activos-caja',
		label: 'Caja',
		shortLabel: 'Caja',
		description: 'Efectivo disponible.',
		categoryKey: 'activos',
		nature: 'debit',
		tone: '#0ea5e9',
		icon: '💵',
	},
	{
		id: 'activos-banco',
		label: 'Banco',
		shortLabel: 'Banco',
		description: 'Saldos en cuentas bancarias.',
		categoryKey: 'activos',
		nature: 'debit',
		tone: '#0284c7',
		icon: '🏦',
	},
	{
		id: 'activos-fondo-inversiones',
		label: 'Fondo de inversiones',
		shortLabel: 'Fondo inversiones',
		description: 'Cuenta interna para fondear y recuperar inversiones.',
		categoryKey: 'activos',
		nature: 'debit',
		tone: '#0f766e',
		icon: '💼',
	},
	{
		id: 'activos-inversiones-productos',
		label: 'Inversiones en productos',
		shortLabel: 'Inv. productos',
		description: 'Inventario o productos comprados para revender.',
		categoryKey: 'activos',
		nature: 'debit',
		tone: '#14b8a6',
		icon: '📦',
		hidden: true,
	},
	{
		id: 'activos-prestamos-otorgados',
		label: 'Préstamos otorgados',
		shortLabel: 'Préstamos otorgados',
		description: 'Dinero prestado a terceros (capital pendiente).',
		categoryKey: 'activos',
		nature: 'debit',
		tone: '#22c55e',
		icon: '🤝',
		hidden: true,
	},
	{
		id: 'pasivos-prestamos-recibidos',
		label: 'Préstamos recibidos',
		shortLabel: 'Préstamos recibidos',
		description: 'Obligaciones por dinero recibido de terceros.',
		categoryKey: 'pasivos',
		nature: 'credit',
		tone: '#f97316',
		icon: '🧾',
	},
	{
		id: 'pasivos-tarjetas-credito',
		label: 'Tarjetas de crédito',
		shortLabel: 'TDC',
		description: 'Saldo pendiente en tarjetas de crédito.',
		categoryKey: 'pasivos',
		nature: 'credit',
		tone: '#f59e0b',
		icon: '💳',
	},
	{
		id: 'ingresos-ordinarios',
		label: 'Ingresos ordinarios',
		shortLabel: 'Ingresos ord.',
		description: 'Ventas y servicios habituales.',
		categoryKey: 'ingresos',
		nature: 'credit',
		tone: '#10b981',
		icon: '📈',
	},
	{
		id: 'ingresos-ganancias-inversion',
		label: 'Ganancia por inversiones',
		shortLabel: 'Gcia. inversiones',
		description: 'Ganancias realizadas de inversiones.',
		categoryKey: 'ingresos',
		nature: 'credit',
		tone: '#c026d3',
		icon: '💰',
	},
	{
		id: 'ingresos-intereses',
		label: 'Intereses ganados',
		shortLabel: 'Intereses',
		description: 'Intereses cobrados por préstamos u otros rendimientos.',
		categoryKey: 'ingresos',
		nature: 'credit',
		tone: '#22c55e',
		icon: '🪙',
	},
	{
		id: 'gastos-alimentacion',
		label: 'Alimentación',
		shortLabel: 'Alimentación',
		description: 'Compras de comida y restaurantes.',
		categoryKey: 'gastos',
		nature: 'debit',
		tone: '#ef4444',
		icon: '🍽️',
	},
	{
		id: 'gastos-transporte',
		label: 'Transporte',
		shortLabel: 'Transporte',
		description: 'Gastos de movilidad.',
		categoryKey: 'gastos',
		nature: 'debit',
		tone: '#f97316',
		icon: '🚌',
	},
	{
		id: 'gastos-servicios',
		label: 'Servicios',
		shortLabel: 'Servicios',
		description: 'Servicios públicos o suscripciones.',
		categoryKey: 'gastos',
		nature: 'debit',
		tone: '#fb7185',
		icon: '💡',
	},
	{
		id: 'gastos-compras-personales',
		label: 'Compras personales',
		shortLabel: 'Compras pers.',
		description: 'Compras no operativas.',
		categoryKey: 'gastos',
		nature: 'debit',
		tone: '#f43f5e',
		icon: '🛍️',
	},
	{
		id: 'gastos-operativos',
		label: 'Gastos operativos',
		shortLabel: 'Gastos oper.',
		description: 'Costos y gastos del negocio.',
		categoryKey: 'gastos',
		nature: 'debit',
		tone: '#ef4444',
		icon: '🧾',
	},
];

export const ACCOUNT_FLOW_RULES = {
	ingreso: {
		from: ['ingresos-ordinarios', 'ingresos-ganancias-inversion', 'ingresos-intereses'],
		to: ['activos-banco', 'activos-caja', 'activos-fondo-inversiones'],
		message: 'Los ingresos salen de Ingresos y aterrizan en Caja/Banco/Fondo.',
	},
	egreso: {
		from: ['activos-banco', 'activos-caja', 'activos-fondo-inversiones'],
		to: ['gastos-alimentacion', 'gastos-transporte', 'gastos-servicios', 'gastos-compras-personales', 'gastos-operativos', 'pasivos-prestamos-recibidos', 'pasivos-tarjetas-credito'],
		message: 'Los egresos salen de Activos y van a Gastos o Pasivos.',
	},
	investmentCapital: {
		from: ['activos-fondo-inversiones'],
		to: ['activos-inversiones-productos', 'activos-prestamos-otorgados'],
		message: 'El capital sale del Fondo de inversiones hacia el activo de la inversión.',
	},
	investmentProfit: {
		from: ['ingresos-ganancias-inversion', 'ingresos-intereses'],
		to: ['activos-banco', 'activos-caja', 'activos-fondo-inversiones'],
		message: 'La ganancia siempre es Ingreso y termina en un activo líquido.',
	},
};

export const TRANSACTION_ACCOUNT_DEFAULTS = {
	ingreso: {
		from: 'ingresos-ordinarios',
		to: 'activos-banco',
	},
	egreso: {
		from: 'activos-banco',
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
		return BASE_ACCOUNTS.filter((account) => !account.hidden);
	}

	return BASE_ACCOUNTS
		.filter((account) => !account.hidden)
		.filter((account) => targetMatchesAccount(account, rule[direction]));
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
	hidden: Boolean(account.hidden),
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
			applyMovement(ledger, 'activos-fondo-inversiones', 'activos-inversiones-productos', capital);
		}

		const profit = salePrice - capital;
		const profitIsRecognized = Boolean(
			purchase.profitTransactionId ||
			purchase.profitRouteVersion
		);
		if (profit > 0 && profitIsRecognized) {
			investmentProfitTotal += profit;
		}
	});

	credits.forEach((credit) => {
		const principal = Number(credit.principalAmount ?? credit.totalAmount) || 0;
		if (principal > 0) {
			applyMovement(ledger, 'activos-fondo-inversiones', 'activos-prestamos-otorgados', principal);
		}

		const totalPaid = Number(credit.totalPaid) || 0;
		const principalRepaid = Math.min(totalPaid, principal);
		if (principalRepaid > 0) {
			applyMovement(ledger, 'activos-prestamos-otorgados', 'activos-fondo-inversiones', principalRepaid);
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
