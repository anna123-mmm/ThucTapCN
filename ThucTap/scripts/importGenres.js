const mongoose = require('mongoose');
const Movie = require('../models/Movie');
const Category = require('../models/category');
require('dotenv').config();

async function importGenresToCategories() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');
        
        // Get all unique genres from movies
        const allGenres = await Movie.distinct('genres');
        const uniqueGenres = [...new Set(allGenres.filter(genre => genre && genre.trim() !== ''))];
        
        console.log(`\n📊 Found ${uniqueGenres.length} unique genres in movies:`);
        uniqueGenres.forEach((genre, index) => {
            console.log(`${index + 1}. ${genre}`);
        });
        
        // Check existing categories
        const existingCategories = await Category.find({});
        const existingCategoryNames = existingCategories.map(c => c.name);
        
        console.log(`\n📋 Existing categories in Category collection: ${existingCategories.length}`);
        
        // Import new genres as categories
        let importedCount = 0;
        for (const genreName of uniqueGenres) {
            if (!existingCategoryNames.includes(genreName)) {
                const newCategory = new Category({
                    name: genreName,
                    description: `${genreName} movies and shows`,
                    status: true,
                    image: '' // No image by default
                });
                
                await newCategory.save();
                console.log(`✅ Imported: ${genreName}`);
                importedCount++;
            } else {
                console.log(`⏭️  Skipped: ${genreName} (already exists)`);
            }
        }
        
        console.log(`\n🎯 Import completed!`);
        console.log(`   - Total genres found: ${uniqueGenres.length}`);
        console.log(`   - Already existed: ${uniqueGenres.length - importedCount}`);
        console.log(`   - Newly imported: ${importedCount}`);
        
        // Show final count
        const finalCount = await Category.countDocuments();
        console.log(`   - Total categories in database: ${finalCount}`);
        
    } catch (error) {
        console.error('❌ Error importing genres to categories:', error.message);
    } finally {
        await mongoose.disconnect();
        console.log('\n🔌 Disconnected from MongoDB');
    }
}

importGenresToCategories();