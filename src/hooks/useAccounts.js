import { useMemo } from 'react';
import {
	BASE_ACCOUNTS,
	ACCOUNT_FLOW_RULES,
	getAccountById,
	getAllowedAccounts,
	validateAccountFlow,
	summarizeAccountBalances,
} from '../services/accounts';

export const useAccounts = () => {
	const accounts = useMemo(() => BASE_ACCOUNTS, []);
	const visibleAccounts = useMemo(() => BASE_ACCOUNTS.filter((a) => !a.hidden), []);

	const accountsByCategory = useMemo(() => {
		return visibleAccounts.reduce((acc, account) => {
			if (!acc[account.categoryKey]) {
				acc[account.categoryKey] = [];
			}
			acc[account.categoryKey].push(account);
			return acc;
		}, {});
	}, [visibleAccounts]);

	return {
		accounts,
		visibleAccounts,
		accountsByCategory,
		flowRules: ACCOUNT_FLOW_RULES,
		getAccountById,
		getAllowedAccounts,
		validateAccountFlow,
		summarizeAccountBalances,
	};
};
