const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        await mongoose.connect("mongodb+srv://virgroupuz:XyvUsWrtI9hny2EZ@cluster0.58s23ow.mongodb.net/?retryWrites=true&w=majority", {
            useNewUrlParser: true,
            dbName: "virgroupuz",
            useUnifiedTopology: true,
        });
        console.log('MongoDB connected');
    } catch (err) {
        console.error('MongoDB connection error:', err);
        process.exit(1);
    }
};

module.exports = connectDB;