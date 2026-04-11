const validate = (schema) => {
  return (req, res, next) => {
    try {
      const { error, value } = schema.validate(req.body ?? {}, {
        abortEarly: false,
      });

      if (error) {
        return res.status(422).json({
          success: false,
          message: "Validation failed",
          errors: error.details.map((d) => ({
            field: d.path[0],
            message: d.message.replace(/"/g, ""),
          })),
        });
      }

      req.body = value;
      next();
    } catch (err) {
      next(err);
    }
  };
};

export default validate;