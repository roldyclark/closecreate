import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import PropTypes from 'prop-types'
import { useSelector, useDispatch } from 'react-redux'
import {
  createProfile,
  getCurrentProfile,
  uploadPicture,
  updateProfilePicture,
  deleteAccount
} from '../../actions/profile'
import { v1 as uuidv1 } from 'uuid'
import Resizer from 'react-image-file-resizer'
import { S3_BUCKET, S3_REGION } from '../../utils/s3_config'

const initialState = {
  location: '',
  bio: '',
  instagram: 'https://instagram.com/',
  youtube: 'https://youtube.com/channel/',
  spotify: 'https://open.spotify.com/artist/',
  soundcloud: 'https://soundcloud.com/',
  bandcamp: 'https://bandcamp.com/'
}

const ProfileForm = ({ history }) => {
  const [formData, setFormData] = useState(initialState)

  const [displaySocialInputs, toggleSocialInputs] = useState(false)

  const { profile, loading } = useSelector((state) => state.profile)

  const [imageSrc, setImageSrc] = useState(profile ? profile.picture : '')

  const dispatch = useDispatch()

  useEffect(() => {
    if (!profile) dispatch(getCurrentProfile())
    if (!loading && profile) {
      const profileData = { ...initialState }
      for (const key in profile) {
        if (key in profileData) profileData[key] = profile[key]
      }
      for (const key in profile.social) {
        if (key in profileData) profileData[key] = profile.social[key]
      }
      setFormData(profileData)
    }
  }, [dispatch, profile, loading])

  const {
    location,
    bio,
    instagram,
    youtube,
    spotify,
    soundcloud,
    bandcamp
  } = formData

  const onChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value })

  const onSubmit = (e) => {
    e.preventDefault()
    dispatch(createProfile(formData, history, profile ? true : false))
  }

  const resizeFile = (file) =>
    new Promise((resolve) => {
      Resizer.imageFileResizer(
        file, // the file from input
        480, // width
        480, // height
        'JPEG', // compress format WEBP, JPEG, PNG
        70, // quality
        0, // rotation
        (uri) => {
          // You upload logic goes here
          resolve(uri)
        },
        'blob' // blob or base64 default base64
      )
    })

  const onFileChange = async (e) => {
    let data = new FormData()
    let file = e.target.files[0]
    let filename = uuidv1() + '.' + file.name.split('.').pop()
    console.log(filename)
    const image = await resizeFile(file)
    data.append('picture', image, filename)
    const config = {
      headers: {
        'content-type': 'multipart/form-data'
      }
    }
    dispatch(uploadPicture(data, config)).then(() => {
      setImageSrc(filename)
    })
    dispatch(updateProfilePicture(filename))
  }

  return (
    <div className="card">
      <h1 className="card-title">Edit Your Profile</h1>
      {imageSrc && (
        <img
          className="rounded"
          src={`https://${S3_BUCKET}.s3.${S3_REGION}.amazonaws.com/${imageSrc}`}
          alt="avatar"
        ></img>
      )}
      <div className="custom-file">
        <label>
          <input
            type="file"
            id="file-input-1"
            name="picture"
            onChange={onFileChange}
          />
          Upload a new profile picture
        </label>
      </div>
      <form className="form" onSubmit={onSubmit}>
        <div className="form-group">
          <input
            className="form-control"
            type="text"
            placeholder="* Location"
            name="location"
            value={location}
            onChange={onChange}
            required
          />
          <small className="form-text">
            City & state suggested (eg. Boston, MA)
          </small>
        </div>
        <div className="form-group">
          <textarea
            className="form-control"
            placeholder="* A short bio of yourself"
            name="bio"
            value={bio}
            onChange={onChange}
            maxLength="140"
            required
          />
          <small className="form-text">
            What do you do? (eg. I am a photographer, drummer, and model.)
          </small>
        </div>

        <button
          onClick={() => toggleSocialInputs(!displaySocialInputs)}
          type="button"
          className="btn btn-light mr-5 mb-5"
        >
          Add Social Network Links
        </button>

        {displaySocialInputs && (
          <>
            <div className="form-group">
              <i className="fab fa-instagram fa-2x" />
              <input
                className="form-control"
                type="text"
                placeholder="Instagram URL"
                name="instagram"
                value={instagram}
                onChange={onChange}
              />
            </div>
            <div className="form-group">
              <i className="fab fa-youtube fa-2x" />
              <input
                className="form-control"
                type="text"
                placeholder="YouTube URL"
                name="youtube"
                value={youtube}
                onChange={onChange}
              />
            </div>
            <div className="form-group">
              <i className="fab fa-spotify fa-2x" />
              <input
                className="form-control"
                type="text"
                placeholder="Spotify URL"
                name="spotify"
                value={spotify}
                onChange={onChange}
              />
            </div>
            <div className="form-group">
              <i className="fab fa-bandcamp fa-2x" />
              <input
                className="form-control"
                type="text"
                placeholder="Bandcamp URL"
                name="bandcamp"
                value={bandcamp}
                onChange={onChange}
              />
            </div>
            <div className="form-group">
              <i className="fab fa-soundcloud fa-2x" />
              <input
                className="form-control"
                type="text"
                placeholder="SoundCloud URL"
                name="soundcloud"
                value={soundcloud}
                onChange={onChange}
              />
            </div>
          </>
        )}

        <input type="submit" className="btn btn-light mr-5" value="Submit" />
        <Link className="btn btn-dark mr-5" to="/dashboard">
          Go Back
        </Link>
        <button
          className="btn btn-danger mt-5"
          onClick={() => dispatch(deleteAccount())}
        >
          Delete My Account
        </button>
      </form>
    </div>
  )
}

ProfileForm.propTypes = {
  history: PropTypes.object.isRequired
}

export default ProfileForm
