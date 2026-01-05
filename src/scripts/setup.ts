import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User';
import Category from '../models/Category';

dotenv.config();

const defaultCategories = [
  { name: 'Short Stories', slug: 'short-stories', description: 'Creative fictional narratives', order: 1 },
  { name: 'Personal Essays', slug: 'personal-essays', description: 'Personal reflections and experiences', order: 2 },
  { name: 'Think Pieces', slug: 'think-pieces', description: 'Analytical and opinion pieces', order: 3 },
  { name: 'Articles', slug: 'articles', description: 'Informative and journalistic content', order: 4 },
  { name: 'Non-Fiction', slug: 'non-fiction', description: 'Factual and educational content', order: 5 }
];

async function setupDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI as string, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    } as mongoose.ConnectOptions);

    console.log('Connected to MongoDB');

    // Create super admin if it doesn't exist
    const superAdminEmail = process.env.SUPER_ADMIN_EMAIL;
    const superAdminPassword = process.env.SUPER_ADMIN_PASSWORD;
    const superAdminName = process.env.SUPER_ADMIN_NAME || 'Super Admin';

    if (!superAdminEmail || !superAdminPassword) {
      console.error('SUPER_ADMIN_EMAIL and SUPER_ADMIN_PASSWORD must be set in environment variables');
      process.exit(1);
    }

    const existingSuperAdmin = await User.findOne({ email: superAdminEmail });
    
    if (!existingSuperAdmin) {
      const superAdmin = new User({
        name: superAdminName,
        email: superAdminEmail,
        password: superAdminPassword,
        role: 'super_admin'
      });

      await superAdmin.save();
      console.log('Super admin created successfully');
    } else {
      console.log('Super admin already exists');
    }

    // Create default categories
    for (const categoryData of defaultCategories) {
      const existingCategory = await Category.findOne({ name: categoryData.name });
      
      if (!existingCategory) {
        const category = new Category(categoryData);
        await category.save();
        console.log(`Category "${categoryData.name}" created`);
      } else {
        console.log(`Category "${categoryData.name}" already exists`);
      }
    }

    console.log('Database setup completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Setup failed:', error);
    process.exit(1);
  }
}

setupDatabase();