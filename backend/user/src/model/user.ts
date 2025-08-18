import mongoose , {Document,Schema} from "mongoose";
//import mongoose from "mongoose";, you are importing the entire mongoose library. This library is an object that contains many different properties and classes, including Document and Schema.
export interface IUser extends Document {
    username: string;
    email: string;
}
// ==>Interface (IUser): A TypeScript tool for type safety, ensuring your code interacts with user documents correctly during development.
const UserSchema: Schema<IUser> = new Schema({
// ==>Schema (UserSchema): A Mongoose tool for defining the structure and rules of MongoDB documents, ensuring data integrity at runtime.
    username: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    }
}, {
    timestamps: true // Automatically adds createdAt and updatedAt fields
});
// ==>Difference: The interface is for compile-time type checking in TypeScript; the schema is for runtime validation and database interaction in Mongoose.
//const user = new User({ username: "john_doe", email: 123 }); // Error!
//Interface (IUser): TypeScript will catch the error at compile time because email is defined as a string in IUser, but you provided a number (123).
// Schema (UserSchema): If the code somehow runs (e.g., in plain JavaScript or if TypeScript is bypassed), Mongoose will throw a validation error at runtime because the schema expects email to be a string and required.

export const User = mongoose.model<IUser>('User', UserSchema);

// export const User = ...: This makes the User model available to be imported and used in other files of your project.
// mongoose.model<IUser>(...): This is the core function call that creates the model.
// mongoose.model() is a Mongoose function that compiles a schema into a model.
// <IUser> is a generic type parameter from TypeScript. It tells Mongoose that all documents created with this model will conform to the structure defined by your IUser interface. This provides strong type-checking and helps prevent errors.
// 'User': This is the name of the model. Mongoose automatically pluralizes this name to determine the name of the collection in your MongoDB database. So, the data for this model will be stored in a collection named users.
// UserSchema: This is the schema object you've defined elsewhere in your code. A schema defines the structure, data types, and validation rules for the documents within the collection. It acts as a blueprint for the data, ensuring consistency.

