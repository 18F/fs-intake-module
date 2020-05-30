/**
 * Module for christmas tree forests model
 * @module models/christmas-trees-forests
 */
module.exports = (sequelize, DataTypes) => sequelize.define(
  'christmasTreesForests',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      field: 'id',
      allowNull: false
    },
    forestName: {
      type: DataTypes.STRING(50),
      field: 'forest_name',
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      field: 'description'
    },
    forestAbbr: {
      type: DataTypes.STRING(255),
      field: 'forest_abbr'
    },
    forestUrl: {
      type: DataTypes.STRING,
      field: 'forest_url'
    },
    treeHeight: {
      type: DataTypes.INTEGER,
      field: 'tree_height'
    },
    stumpHeight: {
      type: DataTypes.INTEGER,
      field: 'stump_height'
    },
    stumpDiameter: {
      type: DataTypes.INTEGER,
      field: 'stump_diameter'
    },
    startDate: {
      type: DataTypes.DATE,
      field: 'start_date',
      allowNull: false
    },
    endDate: {
      type: DataTypes.DATE,
      field: 'end_date',
      allowNull: false
    },
    orgStructureCode: {
      type: DataTypes.STRING,
      field: 'org_structure_code'
    },
    treeCost: {
      type: DataTypes.DOUBLE,
      field: 'tree_cost',
      validate: {
        min: 0
      }
    },
    maxNumTrees: {
      type: DataTypes.INTEGER,
      field: 'max_num_trees',
      validate: {
        min: 0
      }
    },
    allowAdditionalHeight: {
      type: DataTypes.BOOLEAN,
      field: 'allow_additional_height'
    },
    createdAt: {
      type: DataTypes.DATE,
      field: 'created',
      allowNull: false
    },
    updatedAt: {
      type: DataTypes.DATE,
      field: 'updated',
      allowNull: false
    },
    forestNameShort: {
      type: DataTypes.STRING,
      field: 'forest_name_short'
    },
    timezone: {
      type: DataTypes.STRING,
      field: 'timezone'
    },
    cuttingAreas: {
      type: DataTypes.JSONB,
      field: 'cutting_areas'
    },
    possFinancialId: {
      type: DataTypes.STRING(50),
      field: 'poss_financial_id'
    },
    state: {
      type: DataTypes.STRING(50),
      field: 'state'
    },
    region: {
      type: DataTypes.INTEGER,
      field: 'region'
    }
  },
  {
    timestamps: true,
    freezeTableName: true
  }
);
