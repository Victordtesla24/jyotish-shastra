/**
 * Mongoose mock for integration tests
 * Prevents Jest from loading actual mongoose with BSON ES modules
 */

// Define Schema Types first
const SchemaTypes = {
  ObjectId: String,
  Mixed: Object,
  String: String,
  Number: Number,
  Boolean: Boolean,
  Date: Date,
  Array: Array
};

const mongoose = {
  Schema: class Schema {
    constructor(definition, options) {
      this.definition = definition;
      this.options = options;
      this.indexes = [];
      this.methods = {}; // For instance methods
      this.statics = {}; // For static methods
    }
    
    // Add instance methods that Schema uses
    index(fields, options) {
      this.indexes.push({ fields, options });
      return this;
    }
    
    pre(event, fn) {
      return this;
    }
    
    post(event, fn) {
      return this;
    }
    
    virtual(name) {
      return {
        get: () => this,
        set: () => this
      };
    }
  },
  
  model: function(name, schema) {
    return class Model {
      constructor(data) {
        Object.assign(this, data);
      }
      
      static find() {
        return Promise.resolve([]);
      }
      
      static findById() {
        return Promise.resolve(null);
      }
      
      static findOne() {
        return Promise.resolve(null);
      }
      
      save() {
        return Promise.resolve(this);
      }
      
      static create(data) {
        return Promise.resolve(new this(data));
      }
    };
  },
  
  connect: function() {
    return Promise.resolve();
  },
  
  connection: {
    readyState: 1
  }
};

// Add Types as a static property of Schema
mongoose.Schema.Types = SchemaTypes;

export default mongoose;
module.exports = mongoose;

