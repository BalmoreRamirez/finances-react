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

	const accountsByCategory = useMemo(() => {
		return accounts.reduce((acc, account) => {
			if (!acc[account.categoryKey]) {
				acc[account.categoryKey] = [];
			}
			acc[account.categoryKey].push(account);
			return acc;
		}, {});
	}, [accounts]);

	return {
		accounts,
		accountsByCategory,
		flowRules: ACCOUNT_FLOW_RULES,
		getAccountById,
		getAllowedAccounts,
		validateAccountFlow,
		summarizeAccountBalances,
	};
};
