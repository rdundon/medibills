import { User } from './User';
import { MedicalProvider } from './MedicalProvider';
import { MedicalBill } from './MedicalBill';
import { MedicalBillCharges } from './MedicalBillCharges';
import { ExplanationOfBenefits } from './ExplanationOfBenefits';
import { CollectionBill } from './CollectionBill';
import { MedicalServiceEvent } from './MedicalServiceEvent';
import { MedicalBillServiceEvent } from './MedicalBillServiceEvent';
import { MedicalBillPayments } from './MedicalBillPayments';
import { MedicalBillPaymentAssociation } from './MedicalBillPaymentAssociation';

// Define associations between models
const initializeAssociations = () => {
  // User associations
  User.hasMany(MedicalProvider, {
    foreignKey: 'userId',
    as: 'medicalProviders',
    onDelete: 'CASCADE',
  });

  User.hasMany(MedicalBill, {
    foreignKey: 'userId',
    as: 'medicalBills',
    onDelete: 'CASCADE',
  });

  User.hasMany(ExplanationOfBenefits, {
    foreignKey: 'userId',
    as: 'explanationOfBenefits',
    onDelete: 'CASCADE',
  });

  User.hasMany(CollectionBill, {
    foreignKey: 'userId',
    as: 'collectionBills',
    onDelete: 'CASCADE',
  });

  User.hasMany(MedicalServiceEvent, {
    foreignKey: 'userId',
    as: 'medicalServiceEvents',
    onDelete: 'CASCADE',
  });

  User.hasMany(MedicalBillPayments, {
    foreignKey: 'userId',
    as: 'medicalBillPayments',
    onDelete: 'CASCADE',
  });

  // MedicalProvider associations
  MedicalProvider.belongsTo(User, {
    foreignKey: 'userId',
    as: 'user',
  });

  MedicalProvider.hasMany(MedicalBill, {
    foreignKey: 'medicalProviderId',
    as: 'medicalBills',
    onDelete: 'RESTRICT',
  });

  MedicalProvider.hasMany(ExplanationOfBenefits, {
    foreignKey: 'medicalProviderId',
    as: 'explanationOfBenefits',
    onDelete: 'RESTRICT',
  });

  MedicalProvider.hasMany(CollectionBill, {
    foreignKey: 'medicalProviderId',
    as: 'collectionBills',
    onDelete: 'RESTRICT',
  });

  MedicalProvider.hasMany(MedicalServiceEvent, {
    foreignKey: 'medicalProviderId',
    as: 'medicalServiceEvents',
    onDelete: 'RESTRICT',
  });

  // MedicalBill associations
  MedicalBill.belongsTo(User, {
    foreignKey: 'userId',
    as: 'user',
  });

  MedicalBill.belongsTo(MedicalProvider, {
    foreignKey: 'medicalProviderId',
    as: 'medicalProvider',
  });

  MedicalBill.hasOne(MedicalBillCharges, {
    foreignKey: 'medicalBillId',
    as: 'charges',
    onDelete: 'CASCADE',
  });

  MedicalBill.belongsToMany(MedicalServiceEvent, {
    through: MedicalBillServiceEvent,
    foreignKey: 'medicalBillId',
    otherKey: 'medicalServiceEventId',
    as: 'serviceEvents',
    onDelete: 'CASCADE',
  });

  // MedicalBillCharges associations
  MedicalBillCharges.belongsTo(MedicalBill, {
    foreignKey: 'medicalBillId',
    as: 'medicalBill',
  });

  // ExplanationOfBenefits associations
  ExplanationOfBenefits.belongsTo(User, {
    foreignKey: 'userId',
    as: 'user',
  });

  ExplanationOfBenefits.belongsTo(MedicalProvider, {
    foreignKey: 'medicalProviderId',
    as: 'medicalProvider',
  });

  ExplanationOfBenefits.hasMany(MedicalServiceEvent, {
    foreignKey: 'explanationOfBenefitsId',
    as: 'serviceEvents',
    onDelete: 'SET NULL',
  });

  // CollectionBill associations
  CollectionBill.belongsTo(User, {
    foreignKey: 'userId',
    as: 'user',
  });

  CollectionBill.belongsTo(MedicalProvider, {
    foreignKey: 'medicalProviderId',
    as: 'medicalProvider',
  });

  // MedicalServiceEvent associations
  MedicalServiceEvent.belongsTo(User, {
    foreignKey: 'userId',
    as: 'user',
  });

  MedicalServiceEvent.belongsTo(MedicalProvider, {
    foreignKey: 'medicalProviderId',
    as: 'medicalProvider',
  });

  MedicalServiceEvent.belongsToMany(MedicalBill, {
    through: MedicalBillServiceEvent,
    foreignKey: 'medicalServiceEventId',
    otherKey: 'medicalBillId',
    as: 'medicalBills',
    onDelete: 'CASCADE',
  });

  MedicalServiceEvent.belongsTo(ExplanationOfBenefits, {
    foreignKey: 'explanationOfBenefitsId',
    as: 'explanationOfBenefits',
  });

  // MedicalBillPayments associations
  MedicalBillPayments.belongsTo(User, {
    foreignKey: 'userId',
    as: 'user',
  });

  MedicalBill.belongsToMany(MedicalBillPayments, {
    through: MedicalBillPaymentAssociation,
    foreignKey: 'medicalBillId',
    otherKey: 'medicalBillPaymentId',
    as: 'payments',
  });

  MedicalBillPayments.belongsToMany(MedicalBill, {
    through: MedicalBillPaymentAssociation,
    foreignKey: 'medicalBillPaymentId',
    otherKey: 'medicalBillId',
    as: 'medicalBills',
  });
};

// Export all models and initialization function
export {
  User,
  MedicalProvider,
  MedicalBill,
  MedicalBillCharges,
  ExplanationOfBenefits,
  CollectionBill,
  MedicalServiceEvent,
  MedicalBillServiceEvent,
  MedicalBillPayments,
  MedicalBillPaymentAssociation,
  initializeAssociations,
};

// Initialize associations when this module is imported
initializeAssociations();