export async function validateFields($form, keys) {
  for (let i = 0; i < keys.length; i++) {
    await validateField($form, keys[i]);
  }
}

function validateField($form, key) {
  return new Promise((resolve, reject) => {
    if ($form) {
      $form.validateField(key, error => {
        error ? reject(error) : resolve(true);
      });
    } else {
      reject('表单实例不存在');
    }
  });
}

export function clearValidateField($form, keys) {
  setTimeout(() => {
    if ($form) $form.clearValidate(keys);
  }, 0);
}
