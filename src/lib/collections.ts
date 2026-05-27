export const COLLECTIONS = {
  SUPER_ADMINS: 'superAdmins',
  BOUTIQUES: 'boutiques',
  BOUTIQUE_USERS: 'boutiqueUsers',
  STAFF_INVITES: 'staffInvites',
  SUBSCRIPTION_PLANS: 'subscriptionPlans',
  SUBSCRIPTION_PAYMENTS: 'subscriptionPayments',
  ORDERS: 'orders',
  MEASUREMENTS: 'measurements',
  DELETED_RECORDS: 'deletedRecords',
  CUSTOMERS: 'customers',
  MEASUREMENT_TEMPLATES: 'measurementTemplates',
} as const;

export const boutiqueRef = (boutiqueId: string, sub: string) =>
  `${COLLECTIONS.BOUTIQUES}/${boutiqueId}/${sub}`;
