<template>
  <div class="container">
    <!-- Header -->
    <!-- <header>
      <h1>Admin Dashboard</h1>
    </header> -->

    <!-- Quiz Creation Form -->
    <div class="card">
      <h2>Create New Quiz</h2>
      <form @submit.prevent="submitQuiz" enctype="multipart/form-data">
        <!-- Quiz Title -->
        <div class="form-group">
          <label for="quiz-title">Quiz Title</label>
          <input
            type="text"
            id="quiz-title"
            v-model="quiz.quiz_title"
            placeholder="Enter quiz title"
            required
          />
        </div>

        <!-- Quiz Description -->
        <div class="form-group">
          <label for="quiz-description">Quiz Description</label>
          <textarea
            id="quiz-description"
            v-model="quiz.quiz_description"
            rows="4"
            placeholder="Enter a brief description"
            required
          ></textarea>
        </div>

        <!-- Difficulty Level -->
        <div class="form-group">
          <label for="quiz-difficulty">Difficulty Level</label>
          <select id="quiz-difficulty" v-model="quiz.quiz_difficulty">
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>
<!-- 
       
        <div class="form-group">
          <label for="quiz-duration">Duration (in minutes)</label>
          <input
            type="number"
            id="quiz-duration"
            v-model.number="quiz.quiz_duration"
            placeholder="Enter duration"
            required
          />
        </div> -->

        <!-- Single Question Input -->
        <div class="form-group">
          <label for="quiz-question">Quiz Question</label>
          <input
            type="text"
            id="quiz-question"
            v-model="quiz.quiz_question"
            placeholder="Enter the quiz question"
            required
          />
        </div>

        <!-- Clues Section -->
        <div class="clues-container">
          <h3>Clues</h3>
          <div id="clues-wrapper">
            <div
              v-for="(clue, index) in clues"
              :key="index"
              class="clue-group"
            >
              <!-- Only show remove button if there's more than one clue -->
              <button
                v-if="clues.length > 1"
                type="button"
                class="remove-clue-btn"
                @click="removeClue(index)"
                title="Remove Clue"
              >
                &times;
              </button>
              <div class="form-group">
                <label>Clue Title</label>
                <input
                  type="text"
                  v-model="clue.title"
                  placeholder="Enter clue title"
                  required
                />
              </div>
              <div class="form-group">
                <label>Clue</label>
                <input
                  type="text"
                  v-model="clue.text"
                  placeholder="Enter clue"
                  required
                />
              </div>
            </div>
          </div>
          <button type="button" class="btn-add" @click="addClue">
            + Add Clue
          </button>
        </div>

        <!-- Quiz Answer Section -->
        <div class="quiz-answer-container">
          <h3>Quiz Answer / Result Info</h3>

          <!-- Photo Upload (Custom Styled) -->
          <div class="form-group file-upload-group">
            <div class="upload-button-wrapper">
              <input
                type="file"
                id="answer-photo"
                accept="image/*"
                @change="onPhotoSelected"
              />
              <label  v-if="!quizAnswer.photoPreview" for="answer-photo" class="custom-file-upload">
                <i class="upload-icon">+</i>
                <span>Upload a photo related to the topic</span>
              </label>
            </div>
            <!-- Photo preview with remove button -->
            <div v-if="quizAnswer.photoPreview" class="photo-preview">
              <img :src="quizAnswer.photoPreview" alt="Photo Preview" />
              <button type="button" class="remove-photo-btn" @click="removePhoto">✕</button>
            </div>
          </div>

          <!-- Name or Title (Person/Company) -->
          <div class="form-group">
            <label for="answer-name">Name / Title</label>
            <input
              type="text"
              id="answer-name"
              v-model="quizAnswer.name"
              placeholder="e.g. G. R. Gopinath / Air Deccan"
            />
          </div>

          <!-- Timeline -->
          <div class="form-group">
            <label for="answer-timeline">Timeline</label>
            <input
              type="text"
              id="answer-timeline"
              v-model="quizAnswer.timeline"
              placeholder="e.g. 1951 – Present"
            />
          </div>

          <!-- Brief Description -->
          <div class="form-group">
            <label for="answer-description">Brief Description</label>
            <textarea
              id="answer-description"
              v-model="quizAnswer.description"
              rows="4"
              placeholder="Short bio or background"
            ></textarea>
          </div>

          <!-- Extra Sections -->
          <div class="answer-sections">
            <h4>Extra Sections</h4>
            <div
              v-for="(section, sIndex) in quizAnswer.sections"
              :key="sIndex"
              class="answer-section-group"
            >
              <!-- Remove Section Button -->
              <button
                v-if="quizAnswer.sections.length > 1"
                type="button"
                class="remove-section-btn"
                @click="removeAnswerSection(sIndex)"
                title="Remove Section"
              >
                &times;
              </button>

              <div class="form-group">
                <label>Section Title</label>
                <input
                  type="text"
                  v-model="section.title"
                  placeholder="e.g. Key Innovations"
                  required
                />
              </div>

              <!-- Select between Bullet Points or Brief Description -->
              <div class="form-group input-type-select">
                <label>Content Type</label>
                <select v-model="section.inputType">
                  <option value="bullet">Bullet Points</option>
                  <option value="description">Brief Description</option>
                </select>
              </div>

              <!-- Bullet Points Input -->
              <div v-if="section.inputType === 'bullet'" class="bullet-points">
                <div
                  v-for="(bullet, bIndex) in section.bulletPoints"
                  :key="bIndex"
                  class="bullet-point-group"
                >
                  <input
                    type="text"
                    v-model="section.bulletPoints[bIndex]"
                    placeholder="Enter bullet point"
                    class="bullet-input"
                    required
                  />
                  <button
                    type="button"
                    class="remove-bullet-btn"
                    @click="removeBulletPoint(sIndex, bIndex)"
                    title="Remove Bullet"
                  >
                    &times;
                  </button>
                </div>
                <button
                  type="button"
                  class="btn-add-bullet"
                  @click="addBulletPoint(sIndex)"
                >
                  + Add Bullet Point
                </button>
              </div>

              <!-- Brief Description Input -->
              <div v-if="section.inputType === 'description'" class="form-group">
                <label>Section Content</label>
                <textarea
                  v-model="section.description"
                  rows="3"
                  placeholder="Add a brief description"
                ></textarea>
              </div>
            </div>
            <!-- Add Extra Section Button -->
            <button
              type="button"
              class="btn-add-section"
              @click="addAnswerSection"
            >
              + Add Section
            </button>
          </div>
        </div>

        <!-- Submit Button -->
        <button type="submit" class="btn-submit">Create Quiz</button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import axios from 'axios'
// Reactive quiz data
const quiz = ref({
  quiz_title: '',
  quiz_description: '',
  quiz_difficulty: 'easy',
  quiz_duration: null,
  quiz_question: ''
})

// Reactive clues array with an initial clue
const clues = ref([{ title: '', text: '' }])

// Extended Quiz Answer Object with extra sections
const quizAnswer = ref({
  photoFile: null,
  photoPreview: '',
  name: '',
  timeline: '',
  description: '',
  sections: [
    {
      title: '',
      inputType: 'description', // 'bullet' or 'description'
      description: '',
      bulletPoints: []
    }
  ]
})

// Add a new clue
function addClue() {
  clues.value.push({ title: '', text: '' })
}

// Remove a clue by index
function removeClue(index) {
  if (clues.value.length > 1) {
    clues.value.splice(index, 1)
  }
}

// Handle file selection for photo upload
function onPhotoSelected(event) {
  const file = event.target.files[0]
  if (!file) return

  quizAnswer.value.photoFile = file
  const reader = new FileReader()
  reader.onload = (e) => {
    quizAnswer.value.photoPreview = e.target.result
  }
  reader.readAsDataURL(file)
}

// Remove photo preview and file
function removePhoto() {
  quizAnswer.value.photoFile = null
  quizAnswer.value.photoPreview = ''
}

// Add a new extra section
function addAnswerSection() {
  quizAnswer.value.sections.push({
    title: '',
    inputType: 'description',
    description: '',
    bulletPoints: []
  })
}

// Remove an extra section
function removeAnswerSection(index) {
  if (quizAnswer.value.sections.length > 1) {
    quizAnswer.value.sections.splice(index, 1)
  }
}

// Add a bullet point to an extra section
function addBulletPoint(sectionIndex) {
  quizAnswer.value.sections[sectionIndex].bulletPoints.push('')
}

// Remove a bullet point from an extra section
function removeBulletPoint(sectionIndex, bulletIndex) {
  if (quizAnswer.value.sections[sectionIndex].bulletPoints.length > 0) {
    quizAnswer.value.sections[sectionIndex].bulletPoints.splice(bulletIndex, 1)
  }
}

// // Submit quiz (for demo, log the payload)
// function submitQuiz() {
//   const payload = {
//     quiz: { ...quiz.value },
//     clues: [...clues.value],
//     quizAnswer: { ...quizAnswer.value }
//   }
//   console.log('Submitting Payload:', payload)
//   alert('Quiz created successfully! (Check console for payload)')
// }


// Submit quiz using Axios
async function submitQuiz() {
  // Build the FormData payload
  const formData = new FormData()

  // Example: Combine quiz and clues into one JSON string
  const quizData = {
    ...quiz.value,
    clues: clues.value
  }
  // Combine answer details (except file) into one JSON string  
  // (If you wish, you may separate fields differently in your backend)
  const quizResults = {
    name: quizAnswer.value.name,
    timeline: quizAnswer.value.timeline,
    description: quizAnswer.value.description,
    sections: quizAnswer.value.sections
  }
  
  // Append FormData fields – note: keys must match what your backend expects.
  formData.append('quiz_data', JSON.stringify(quizData))
  formData.append('quiz_answer', JSON.stringify(quizResults))
  
  // Append file if selected (key 'result_photo' must match backend code)
  if (quizAnswer.value.photoFile) {
    formData.append('result_photo', quizAnswer.value.photoFile)
  }
  
  // For demonstration, we set these fields (change as needed)
  formData.append('participants_ids', JSON.stringify([]))
  formData.append('participants_count', 0)

  try {
    const response = await axios.post(
      'http://quiz.thecore.in/backend-dev/admin/quiz-history/create',
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    )

    console.log('Response:', response.data)
    if(response.data){
      if(response.data.message == "Unauthorized"){
        alert("Session expired. Please login again.")
        // window.location.href = "/login"
      } else {
         window.location.href = "/dashboard"
        alert('Quiz created successfully!')
      }
    }
   
  } catch (error) {
    console.error('Error submitting quiz:', error)
    alert('Error submitting quiz. Check console for details.')
  }
}
</script>

<style scoped>
/* Base CSS Reset & Typography */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Poppins', sans-serif;
  background: #f5f5f5;
  color: #333;
  line-height: 1.6;
}

a {
  text-decoration: none;
  color: inherit;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

header {
  background: #fff;
  padding: 20px;
  border-bottom: 1px solid #ddd;
  margin-bottom: 30px;
}

header h1 {
  font-size: 24px;
  font-weight: 600;
}

/* Card Container for the Form */
.card {
  background: #fff;
  padding: 30px;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  margin-bottom: 30px;
}

.card h2 {
  margin-bottom: 20px;
  font-size: 22px;
  color: #007bff;
}

/* Form Styles */
form {
  width: 100%;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
}

.form-group input[type="text"],
.form-group input[type="number"],
.form-group textarea,
.form-group select {
  width: 100%;
  padding: 12px 15px;
  border: 1px solid #ccc;
  border-radius: 5px;
  font-size: 16px;
  transition: border-color 0.3s ease;
}

.form-group input[type="text"]:focus,
.form-group input[type="number"]:focus,
.form-group textarea:focus,
.form-group select:focus {
  border-color: #007bff;
  outline: none;
}

/* Clues Section */
.clues-container {
  margin-top: 20px;
}

.clues-container h3 {
  margin-bottom: 15px;
  font-size: 20px;
  font-weight: 600;
  color: #333;
}

.clue-group {
  background: #f9f9f9;
  padding: 15px;
  border-radius: 6px;
  margin-bottom: 15px;
  position: relative;
  border: 1px solid #e0e0e0;
}

/* Remove Clue Button */
.remove-clue-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  background: #dc3545;
  color: #fff;
  border: none;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  cursor: pointer;
  font-size: 16px;
  line-height: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.3s ease;
}

.remove-clue-btn:hover {
  background: #c82333;
}

/* Add Clue Button */
.btn-add {
  background: #28a745;
  color: #fff;
  border: none;
  border-radius: 4px;
  padding: 10px 20px;
  font-size: 16px;
  cursor: pointer;
  transition: background 0.3s ease, transform 0.2s ease;
  margin-top: 10px;
  display: inline-block;
}

.btn-add:hover {
  background: #218838;
  transform: translateY(-2px);
}

/* Quiz Answer Section */
.quiz-answer-container {
  margin-top: 30px;
}

.quiz-answer-container h3 {
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 20px;
}

/* Custom file upload styling */
.file-upload-group {
  position: relative;
}

.upload-button-wrapper {
  position: relative;
  display: inline-block;
}

.custom-file-upload {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 8px 12px;
  cursor: pointer;
  background: #17a2b8;
  color: #fff;
  border-radius: 50px;
  font-size: 14px;
  transition: background 0.3s ease, transform 0.2s ease;
}

.upload-icon {
  background: #fff;
  color: #17a2b8;
  font-weight: bold;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-right: 5px;
}

.custom-file-upload:hover {
  background: #138496;
  transform: translateY(-2px);
}

/* Hide default file input */
input[type="file"] {
  display: none;
}

/* Photo preview with remove button */
.photo-preview {
  position: relative;
  display: inline-block;
  margin-top: 10px;
}
.photo-preview img {
  max-width: 200px;
  border-radius: 6px;
  border: 1px solid #ccc;
}
.remove-photo-btn {
  position: absolute;
  top: 5px;
  right: 5px;
  background: #dc3545;
  color: #fff;
  border: none;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Extra Sections */
.answer-sections {
  margin-top: 20px;
}

.answer-sections h4 {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 10px;
}

.answer-section-group {
  background: #f9f9f9;
  padding: 15px;
  border-radius: 6px;
  margin-bottom: 15px;
  position: relative;
  border: 1px solid #e0e0e0;
}

/* Remove Section Button */
.remove-section-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  background: #dc3545;
  color: #fff;
  border: none;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  cursor: pointer;
  font-size: 16px;
  line-height: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.3s ease;
}

.remove-section-btn:hover {
  background: #c82333;
}

/* Input Type Select for Extra Sections */
.input-type-select select {
  padding: 8px 10px;
  border-radius: 4px;
  border: 1px solid #ccc;
  font-size: 14px;
  width: auto;
  margin-top: 5px;
}

/* Bullet Points */
.bullet-points {
  margin-top: 10px;
}
.bullet-point-group {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}
.bullet-point-group input[type="text"] {
  flex: 1;
  margin-right: 8px;
  padding: 10px;
  font-size: 16px;
  min-height: 42px;
}
.remove-bullet-btn {
  background: #dc3545;
  color: #fff;
  border: none;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  cursor: pointer;
  font-size: 16px;
  line-height: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.3s ease;
}

.remove-bullet-btn:hover {
  background: #c82333;
}
.btn-add-bullet {
  background: #ffc107;
  color: #333;
  border: none;
  border-radius: 4px;
  padding: 8px 16px;
  font-size: 14px;
  cursor: pointer;
  transition: background 0.3s ease, transform 0.2s ease;
  margin-top: 5px;
  display: inline-block;
}
.btn-add-bullet:hover {
  background: #e0a800;
  transform: translateY(-2px);
}

/* Add Extra Section Button */
.btn-add-section {
  background: #17a2b8;
  color: #fff;
  border: none;
  border-radius: 4px;
  padding: 10px 20px;
  font-size: 16px;
  cursor: pointer;
  transition: background 0.3s ease, transform 0.2s ease;
  margin-top: 10px;
  display: inline-block;
}
.btn-add-section:hover {
  background: #138496;
  transform: translateY(-2px);
}

/* Submit Button */
.btn-submit {
  background: #007bff;
  color: #fff;
  padding: 12px 25px;
  border: none;
  border-radius: 5px;
  font-size: 16px;
  cursor: pointer;
  transition: background 0.3s ease;
  margin-top: 20px;
  display: inline-block;
}
.btn-submit:hover {
  background: #0056b3;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .container {
    padding: 15px;
  }
  header,
  .card {
    padding: 15px;
  }
  header h1 {
    font-size: 20px;
  }
  .card h2 {
    font-size: 20px;
  }
  .btn-add,
  .btn-submit,
  .btn-add-bullet,
  .btn-add-section {
    font-size: 14px;
    padding: 10px 16px;
  }
  .remove-clue-btn,
  .remove-section-btn,
  .remove-bullet-btn,
  .remove-photo-btn {
    width: 20px;
    height: 20px;
    font-size: 14px;
    line-height: 18px;
  }
}
</style>
