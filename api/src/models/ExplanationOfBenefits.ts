import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';
import { ExplanationOfBenefitsAttributes } from '../types';

interface ExplanationOfBenefitsCreationAttributes extends Optional<ExplanationOfBenefitsAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

class ExplanationOfBenefits extends Model<ExplanationOfBenefitsAttributes, ExplanationOfBenefitsCreationAttributes> implements ExplanationOfBenefitsAttributes {
  public id!: string;
  public userId!: string;
  public medicalProviderId!: string;
  public dateOfService!: Date;
  public totalPaid!: number;
  public totalBilled!: number;
  public totalDiscount!: number;
  public totalMayOwe!: number;
  public insurer!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

ExplanationOfBenefits.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id',
    },
    onDelete: 'CASCADE',
  },
  medicalProviderId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'medical_providers',
      key: 'id',
    },
    onDelete: 'RESTRICT',
  },
  dateOfService: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    validate: {
      isDate: true,
      notEmpty: true,
    },
  },
  totalPaid: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0,
      isDecimal: true,
    },
  },
  totalBilled: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0,
      isDecimal: true,
    },
  },
  totalDiscount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0,
    validate: {
      min: 0,
      isDecimal: true,
    },
  },
  totalMayOwe: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0,
      isDecimal: true,
    },
  },
  insurer: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [1, 255],
    },
  },
}, {
  sequelize,
  modelName: 'ExplanationOfBenefits',
  tableName: 'explanation_of_benefits',
  timestamps: true,
  indexes: [
    {
      fields: ['userId'],
    },
    {
      fields: ['userId', 'dateOfService'],
    },
    {
      fields: ['medicalProviderId'],
    },
  ],
});

export { ExplanationOfBenefits };