export const COLLECTIONS = {
  SUPER_ADMINS: 'superAdmins',
  BOUTIQUES: 'boutiques',
  BOUTIQUE_USERS: 'boutiqueUsers',
  STAFF_INVITES: 'staffInvites',
  SUBSCRIPTION_PLANS: 'subscriptionPlans',
  ORDERS: 'orders',
  MEASUREMENTS: 'measurements',
  BILLING: 'billing',
  DELETED_RECORDS: 'deletedRecords',
} as const;

export const boutiqueRef = (boutiqueId: string, sub: string) =>
  `${COLLECTIONS.BOUTIQUES}/${boutiqueId}/${sub}`;
