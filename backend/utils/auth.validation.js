const Joi = require('joi');

const loginSchema = Joi.object({
  username: Joi.string().required().messages({
    'string.empty': 'Vui lòng nhập tên đăng nhập',
    'any.required': 'Vui lòng nhập tên đăng nhập',
  }),
  password: Joi.string().min(6).required().messages({
    'string.min': 'Mật khẩu phải có ít nhất 6 ký tự',
    'string.empty': 'Vui lòng nhập mật khẩu',
    'any.required': 'Vui lòng nhập mật khẩu',
  }),
});

const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().required(),
  newPassword: Joi.string().min(6).required()
    .not(Joi.ref('currentPassword')) // Mật khẩu mới không được trùng cũ
    .messages({
      'any.invalid': 'Mật khẩu mới không được trùng với mật khẩu cũ',
      'string.min': 'Mật khẩu phải có ít nhất 6 ký tự',
    }),
});

module.exports = {
  loginSchema,
  changePasswordSchema,
};
