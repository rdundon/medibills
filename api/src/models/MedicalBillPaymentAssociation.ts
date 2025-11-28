import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database';

interface MedicalBillPaymentAssociationAttributes {
  medicalBillId: string;
  medicalBillPaymentId: string;
}

class MedicalBillPaymentAssociation extends Model<MedicalBillPaymentAssociationAttributes> implements MedicalBillPaymentAssociationAttributes {
  public medicalBillId!: string;
  public medicalBillPaymentId!: string;
}

MedicalBillPaymentAssociation.init({
  medicalBillId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'medical_bills',
      key: 'id',
    },
    onDelete: 'CASCADE',
    primaryKey: true,
  },
  medicalBillPaymentId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'medical_bill_payments',
      key: 'id',
    },
    onDelete: 'CASCADE',
    primaryKey: true,
  },
}, {
  sequelize,
  modelName: 'MedicalBillPaymentAssociation',
  tableName: 'medical_bill_payment_associations',
  timestamps: false,
});

export { MedicalBillPaymentAssociation };