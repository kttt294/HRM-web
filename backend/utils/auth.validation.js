const Joi = require('joi');

const loginSchema = Joi.object({
  username: Joi.string().required().max(500).messages({
    "string.empty": "Vui lòng nhập tên đăng nhập",
    "string.max": "Tên đăng nhập không được quá 500 ký tự",
    "any.required": "Vui lòng nhập tên đăng nhập",
  }),
  password: Joi.string().min(5).max(500).required().messages({
    "string.min": "Mật khẩu phải có ít nhất 5 ký tự",
    "string.max": "Mật khẩu không được quá 500 ký tự",
    "string.empty": "Vui lòng nhập mật khẩu",
    "any.required": "Vui lòng nhập mật khẩu",
  }),
});

const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().required(),
  newPassword: Joi.string().min(5).required()
    .not(Joi.ref('currentPassword')) // Mật khẩu mới không được trùng cũ
    .messages({
      'any.invalid': 'Mật khẩu mới không được trùng với mật khẩu cũ',
      'string.min': 'Mật khẩu phải có ít nhất 5 ký tự',
    }),
});

module.exports = {
  loginSchema,
  changePasswordSchema,
};
