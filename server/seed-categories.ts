import { db } from "./db";
import { categories } from "../shared/schema";

const seedCategories = [
  {
    id: '7bf337dc-dfc7-4512-90ba-3995fd09787d',
    name: 'Old AC',
    unit: 'unit',
    minRate: '800.00',
    maxRate: '1500.00',
    icon: 'AirVent'
  },
  {
    id: '3328fffe-35d4-4efc-b66e-41b0adc7da34',
    name: 'Refrigerator',
    unit: 'unit',
    minRate: '1200.00',
    maxRate: '2000.00',
    icon: 'Refrigerator'
  },
  {
    id: '5639017a-b647-4fb0-b51b-51e1ae273342',
    name: 'Washing Machine',
    unit: 'unit',
    minRate: '600.00',
    maxRate: '1200.00',
    icon: 'WashingMachine'
  },
  {
    id: '60d57280-788c-4bc4-9953-d6d6c0ec33f8',
    name: 'Iron',
    unit: 'unit',
    minRate: '100.00',
    maxRate: '300.00',
    icon: 'CircuitBoard'
  },
  {
    id: '326f4781-19eb-4db8-89f3-84ab23a90ee5',
    name: 'Copper',
    unit: 'kg',
    minRate: '400.00',
    maxRate: '500.00',
    icon: 'CircuitBoard'
  },
  {
    id: 'e8729ec3-e59e-4cf0-9817-c07b73dfa44d',
    name: 'Plastic',
    unit: 'kg',
    minRate: '10.00',
    maxRate: '20.00',
    icon: 'Trash2'
  },
  {
    id: 'ed0bfaac-26c7-4135-88cb-81428f894b2d',
    name: 'Paper',
    unit: 'kg',
    minRate: '8.00',
    maxRate: '15.00',
    icon: 'FileText'
  },
  {
    id: 'd97876ff-d1ea-4bf7-af02-50c9acb93c89',
    name: 'Books',
    unit: 'kg',
    minRate: '12.00',
    maxRate: '18.00',
    icon: 'BookOpen'
  },
  {
    id: '2afce35f-5e04-4afd-8bda-376bbb87eeda',
    name: 'Clothes',
    unit: 'kg',
    minRate: '5.00',
    maxRate: '10.00',
    icon: 'Shirt'
  }
];

async function seedCategoriesData() {
  try {
    console.log('🌱 Seeding categories...');
    
    for (const category of seedCategories) {
      await db.insert(categories)
        .values(category)
        .onConflictDoNothing();
    }
    
    console.log('✅ Categories seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding categories:', error);
    process.exit(1);
  }
}

seedCategoriesData();
