const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '../.env') });

const { connectDB, disconnectDB } = require('../config/db');
const User = require('../models/User');
const Article = require('../models/Article');
const Category = require('../models/Category');
const Author = require('../models/Author');
const Tag = require('../models/Tag');

async function checkDataIntegrity() {
  console.log('====================================================');
  console.log('   TECHBLOG - DATABASE DATA INTEGRITY AUDIT         ');
  console.log('====================================================\n');

  try {
    await connectDB();

    const [userCount, articleCount, categoryCount, authorCount, tagCount] = await Promise.all([
      User.countDocuments(),
      Article.countDocuments(),
      Category.countDocuments(),
      Author.countDocuments(),
      Tag.countDocuments()
    ]);

    console.log(`📊 Current Collection Counts:`);
    console.log(`   - Users:      ${userCount}`);
    console.log(`   - Articles:   ${articleCount}`);
    console.log(`   - Categories: ${categoryCount}`);
    console.log(`   - Authors:    ${authorCount}`);
    console.log(`   - Tags:       ${tagCount}\n`);

    let issuesFound = 0;

    // 1. Check Admin User
    const adminUser = await User.findOne({ role: 'admin' });
    if (!adminUser) {
      console.error('❌ [FAIL] No admin user found in database!');
      issuesFound++;
    } else {
      console.log(`✅ [PASS] Admin user verified: ${adminUser.email} (ID: ${adminUser._id})`);
    }

    // 2. Check for duplicate slugs
    const checkDuplicateSlugs = async (Model, modelName) => {
      const duplicates = await Model.aggregate([
        { $group: { _id: '$slug', count: { $sum: 1 } } },
        { $match: { count: { $gt: 1 } } }
      ]);
      if (duplicates.length > 0) {
        console.error(`❌ [FAIL] Found duplicate slugs in ${modelName}:`, duplicates);
        issuesFound++;
      } else {
        console.log(`✅ [PASS] No duplicate slugs found in ${modelName}.`);
      }
    };

    await checkDuplicateSlugs(Article, 'Article');
    await checkDuplicateSlugs(Category, 'Category');
    await checkDuplicateSlugs(Author, 'Author');
    await checkDuplicateSlugs(Tag, 'Tag');

    // 3. Check Article Foreign Key References
    const articles = await Article.find().lean();
    const categories = await Category.find().lean();
    const authors = await Author.find().lean();

    const categoryIdSet = new Set(categories.map(c => c._id.toString()));
    const authorIdSet = new Set(authors.map(a => a._id.toString()));

    let brokenCategoryRefs = 0;
    let brokenAuthorRefs = 0;
    let articlesMissingRequired = 0;

    for (const art of articles) {
      if (!art.category || !categoryIdSet.has(art.category.toString())) {
        console.error(`❌ [FAIL] Article '${art.title}' (${art._id}) references missing category: ${art.category}`);
        brokenCategoryRefs++;
        issuesFound++;
      }
      if (!art.author || !authorIdSet.has(art.author.toString())) {
        console.error(`❌ [FAIL] Article '${art.title}' (${art._id}) references missing author: ${art.author}`);
        brokenAuthorRefs++;
        issuesFound++;
      }
      if (!art.title || !art.slug || !art.content || !art.excerpt) {
        console.error(`❌ [FAIL] Article (${art._id}) missing required fields.`);
        articlesMissingRequired++;
        issuesFound++;
      }
    }

    if (brokenCategoryRefs === 0) console.log('✅ [PASS] All article category foreign keys valid.');
    if (brokenAuthorRefs === 0) console.log('✅ [PASS] All article author foreign keys valid.');
    if (articlesMissingRequired === 0) console.log('✅ [PASS] All articles contain required fields.');

    // 4. Check category and author articleCount synchronization
    for (const cat of categories) {
      const realCount = await Article.countDocuments({ category: cat._id, status: 'published' });
      if (cat.articleCount !== realCount) {
        console.warn(`⚠️ [SYNC] Category '${cat.name}' articleCount is ${cat.articleCount}, actual is ${realCount}. Resynchronizing...`);
        await Category.findByIdAndUpdate(cat._id, { articleCount: realCount });
      }
    }
    console.log('✅ [PASS] Category article counts synchronized.');

    for (const author of authors) {
      const realCount = await Article.countDocuments({ author: author._id, status: 'published' });
      if (author.articleCount !== realCount) {
        console.warn(`⚠️ [SYNC] Author '${author.name}' articleCount is ${author.articleCount}, actual is ${realCount}. Resynchronizing...`);
        await Author.findByIdAndUpdate(author._id, { articleCount: realCount });
      }
    }
    console.log('✅ [PASS] Author article counts synchronized.');

    console.log('\n====================================================');
    if (issuesFound === 0) {
      console.log('🎉 ALL DATA INTEGRITY CHECKS PASSED WITH 0 ISSUES!');
    } else {
      console.error(`⚠️ ${issuesFound} DATA INTEGRITY ISSUES FOUND.`);
    }
    console.log('====================================================\n');

    await disconnectDB();
    process.exit(issuesFound === 0 ? 0 : 1);
  } catch (err) {
    console.error('❌ Data integrity audit error:', err);
    await disconnectDB();
    process.exit(1);
  }
}

checkDataIntegrity();
