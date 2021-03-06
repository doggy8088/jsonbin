const mongoose = require('./index');
const uuid = require('uuid');

const TYPE_FREE = 'FREE';
const TYPE_SUPPORTER = 'SUPPORTER';
const TYPE_PRO = 'PRO';

const schema = mongoose.Schema({
  username: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
    index: {
      unique: true,
    },
  },
  publicId: {
    type: String,
    default: uuid.v4,
    required: true,
    index: {
      unique: true,
    },
  },
  apikey: {
    type: String,
    default: uuid.v4,
    required: true,
    index: {
      unique: true,
    },
  },
  email: {
    type: String,
    lowercase: true,
    trim: true,
  },
  store: {},
  public: [],
  created: {
    type: Date,
    default: Date.now
  },
  updated: {
    type: Date,
    default: Date.now,
  },
  requests: {},
  accountType: {
    updated: Date,
    name: {
      type: String,
      enum: [TYPE_FREE, TYPE_SUPPORTER, TYPE_PRO],
      default: TYPE_FREE,
    }
  },
}, { strict: false, minimize: false });

schema.pre('save', function (next) {
  this.updated = Date.now();

  // handle migration
  if (!this.requests) {
    this.requests = {};
  }

  next();
});


schema.statics.findOrCreate = ({ githubId = null, email } = {}, data) => {
  return User.findOne({ githubId }).then(user => {
    if (user) {
      return user;
    }

    const body = {
      email,
      githubId,
      store: data.store || null,
      apikey: uuid.v4(),
      username: data.login,
    }

    if (!body.store) {
      body.store = {
        gettingStarted: `check out the *help*, and try 'curl ${process.env.HOST}/${body.username} -H "authorization: token ${body.apikey}"'`,
        urls: ['help', 'me', 'logout'].map(_ => `${process.env.HOST}/_/${_}`),
      };
    }

    return new User(body).save();
  }).catch(e => {
    console.log('failed', e);
    throw e;
  });
};

const User = module.exports = mongoose.model('user', schema);
