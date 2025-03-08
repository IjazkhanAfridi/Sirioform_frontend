import React, { useState, useEffect } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import ReCAPTCHA from 'react-google-recaptcha';
import { useNavigate } from 'react-router-dom';

const RegisterInstructor = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    fiscalCode: '',
    brevetNumber: '',
    qualifications: [{ qualificationId: '', expirationDate: '' }],
    piva: '',
    address: '',
    city: '',
    region: '',
    email: '',
    phone: '',
    username: '',
    password: '',
    repeatPassword: '',
  });

  const [recaptchaToken, setRecaptchaToken] = useState(null);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState('');

  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{12,}$/;

  const regionOptions = [
    'ABRUZZO',
    'BASILICATA',
    'CALABRIA',
    'CAMPANIA',
    'EMILIA-ROMAGNA',
    'FRIULI-VENEZIA GIULIA',
    'LAZIO',
    'LIGURIA',
    'LOMBARDIA',
    'MARCHE',
    'MOLISE',
    'PIEMONTE',
    'PUGLIA',
    'SARDEGNA',
    'SICILIA',
    'TOSCANA',
    'TRENTINO-ALTO ADIGE',
    'UMBRIA',
    "VALLE D'AOSTA",
    'VENETO',
  ];

  const validateForm = () => {
    const newErrors = {};
    for (const [key, value] of Object.entries(formData)) {
      if (key !== 'qualifications' && !value) {
        newErrors[key] = 'This field is required';
      }
    }

    if (formData.password && !passwordRegex.test(formData.password)) {
      newErrors.password =
        'Password must be at least 12 characters long and include uppercase, lowercase, a number, and a special character.';
    }

    if (
      formData.password &&
      formData.repeatPassword &&
      formData.password !== formData.repeatPassword
    ) {
      newErrors.repeatPassword = 'Passwords do not match';
    }

    // Validate qualifications
    formData.qualifications.forEach((qual, index) => {
      if (!qual.name || !qual.expirationDate) {
        newErrors[`qualifications-${index}`] =
          'All qualification fields are required.';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e, index, field) => {
    if (field === 'qualifications') {
      const newQualifications = [...formData.qualifications];
      newQualifications[index][e.target.name] = e.target.value;
      setFormData({ ...formData, qualifications: newQualifications });
    } else {
      setFormData({
        ...formData,
        [e.target.name]: e.target.value,
      });
    }
    setErrors((prevErrors) => ({ ...prevErrors, [e.target.name]: '' }));
  };
  const qualificationOptions = ['BLSK', 'BLS', 'BLSD'];

  const handleQualificationChange = (index, e) => {
    const newQualifications = [...formData.qualifications];
    newQualifications[index][e.target.name] = e.target.value;
    setFormData({ ...formData, qualifications: newQualifications });
    setErrors((prevErrors) => ({
      ...prevErrors,
      [`qualifications-${index}`]: '',
    }));
  };

  const handleRemoveQualification = (index) => {
    const updatedQualifications = formData.qualifications.filter(
      (_, i) => i !== index
    );
    setFormData({ ...formData, qualifications: updatedQualifications });
  };

  const addQualification = () => {
    setFormData({
      ...formData,
      qualifications: [
        ...formData.qualifications,
        { name: '', expirationDate: '' },
      ],
    });
  };

  const selectedQualifications = formData.qualifications.map((q) => q.name);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    if (!recaptchaToken) {
      alert('Please complete the reCAPTCHA');
      return;
    }

    try {
      const res = await axios.post(
        'http://172.232.209.245/api/instructors/register',
        {
          ...formData,
          recaptchaToken,
        }
      );
      setMessage('Registration successful! Check your email for confirmation.');
    } catch (err) {
      setMessage('Error in registration. Please try again.');
    }
  };

  const handleRecaptcha = (value) => {
    setRecaptchaToken(value);
  };

  const handleCloseModal = () => {
    if (
      message === 'Registration successful! Check your email for confirmation.'
    ) {
      navigate('/login');
    } else {
      setMessage('');
    }
  };

  return (
    <div className='container mt-5'>
      <h2 className='mb-4'>Register Instructor</h2>
      {message && (
        <div className='modal modal-xl show d-block' tabIndex='-1'>
          <div className='modal-dialog'>
            <div className='modal-content'>
              <div className='modal-header'>
                <h5 className='modal-title'>Registration Status</h5>
                <button
                  type='button'
                  className='close'
                  onClick={handleCloseModal}
                >
                  <span>&times;</span>
                </button>
              </div>
              <div className='modal-body'>
                <p className='text-center'>{message}</p>
                <div className='d-flex justify-content-center gap-4'>
                  <button
                    onClick={handleCloseModal}
                    className='btn btn-primary btn-sm'
                  >
                    Okay
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      <form onSubmit={handleSubmit}>
        <div className='row'>
          {Object.entries(formData).map(([key, value]) => {
            if (
              key === 'qualifications' ||
              key === 'password' ||
              key === 'repeatPassword'
            )
              return null;

            return (
              <div key={key} className='col-md-6 mb-3'>
                <label htmlFor={key} className='form-label'>
                  {key
                    .replace(/([A-Z])/g, ' $1')
                    .replace(/^./, (str) => str.toUpperCase())}
                </label>
                {key === 'region' ? (
                  <select
                    id={key}
                    name={key}
                    className='form-select'
                    value={value}
                    onChange={(e) => handleChange(e)}
                  >
                    <option value=''>Select Region</option>
                    {regionOptions.map((region) => (
                      <option key={region} value={region}>
                        {region}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type={key === 'email' ? 'email' : 'text'}
                    className='form-control'
                    id={key}
                    name={key}
                    value={value}
                    onChange={handleChange}
                    placeholder={key}
                  />
                )}
                {errors[key] && (
                  <div className='text-danger'>{errors[key]}</div>
                )}
              </div>
            );
          })}

          {/* Password fields */}
          {['password', 'repeatPassword'].map((field) => (
            <div key={field} className='col-md-6 mb-3'>
              <label htmlFor={field} className='form-label'>
                {field === 'password' ? 'Password' : 'Repeat Password'}
              </label>
              <input
                type='password'
                className='form-control'
                id={field}
                name={field}
                value={formData[field]}
                onChange={handleChange}
                placeholder={field}
              />
              {errors[field] && (
                <div className='text-danger'>{errors[field]}</div>
              )}
            </div>
          ))}

          {/* Qualifications */}
          <div className='col-12 mb-3'>
            <h5>Qualifications</h5>
            {formData.qualifications.map((qualification, index) => {
              const availableOptions = qualificationOptions.filter(
                (option) =>
                  !selectedQualifications.includes(option) ||
                  option === qualification.name
              );
              return (
                <>
                  <div key={index} className='col-md-12 mb-3'>
                    <div className='row'>
                      <div className='col-md-5'>
                        <label
                          htmlFor={`qualification-name-${index}`}
                          className='form-label'
                        >
                          Qualification
                        </label>
                        <select
                          class='form-select'
                          aria-label='Default select example'
                          id={`qualification-name-${index}`}
                          name='name'
                          value={qualification.name}
                          onChange={(e) => handleQualificationChange(index, e)}
                          placeholder='Qualification'
                        >
                          <option selected>Select Qualification</option>
                          {availableOptions.map((option) => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className='col-md-5'>
                        <label
                          htmlFor={`expirationDate-${index}`}
                          className='form-label'
                        >
                          Expiration Date
                        </label>
                        <input
                          type='date'
                          className='form-control'
                          id={`expirationDate-${index}`}
                          name='expirationDate'
                          value={qualification.expirationDate}
                          onChange={(e) => handleQualificationChange(index, e)}
                          min={new Date().toISOString().split('T')[0]}
                          required
                        />
                      </div>
                      <div className='col-md-2 d-flex align-items-end'>
                        <button
                          type='button'
                          className='btn btn-danger'
                          onClick={() => handleRemoveQualification(index)}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                    {errors[`qualifications-${index}`] && (
                      <div className='text-danger'>
                        {errors[`qualifications-${index}`]}
                      </div>
                    )}
                  </div>
                </>
              );
            })}
            <button
              type='button'
              className='btn btn-secondary'
              onClick={addQualification}
            >
              Add Qualification
            </button>
          </div>
        </div>

        <ReCAPTCHA
          sitekey='6LfhQhcqAAAAAHPx5jGmeyWyQLJIwLZwmbIk9iHp'
          onChange={handleRecaptcha}
        />
        <button type='submit' className='btn btn-primary mt-4'>
          Register
        </button>
      </form>
    </div>
  );
};

export default RegisterInstructor;
