import { body, ValidationChain } from 'express-validator';

const signUpValidator: ValidationChain[] = [
  body('firstName').isString().withMessage('First name is required.'),
  body('lastName').isString().withMessage('Last name is required.'),
  body('email').isEmail().withMessage('Invalid Email'),
  body('dateOfBirth').isDate().withMessage('Please provide a valid date of birth.'),
  body('countryCode').isString().withMessage('Invalid Country Code'),
  body('phoneNumber').isString().withMessage('Invalid Phone Number'),
  body('password')
    .isStrongPassword({
      minLength: 8,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1,
    })
    .withMessage(
      'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character'
    ),
  body('passwordConfirm').custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error('Passwords are not the same.');
    }
    return true;
  }),
  body('gender').isString().isIn(['Male', 'Female', 'Other']).withMessage('Invalid Gender'),
  body('profilePic').optional().isString().isURL().withMessage('Invalid Url For Profile Pic'),
];

const logInValidator: ValidationChain[] = [
  body('countryCode').isString().withMessage('Invalid Country '),
  body('phoneNumber').isString().withMessage('Invalid Phone Number'),
  body('password').isString().withMessage('Invalid Password'),
];

const addProductsValidator = [
  body('products').isArray().withMessage('Products should be an array.'), // Check if 'products' is an array
  body('products.*.name').isString().withMessage('Product name should be a string.').notEmpty().withMessage('Product name is required.'),
  body('products.*.qty').isInt({ min: 1 }).withMessage('Product quantity should be a positive integer.'),
  body('products.*.rate').isFloat({ min: 0 }).withMessage('Product rate should be a positive number.'),
];

export { signUpValidator, logInValidator, addProductsValidator };
