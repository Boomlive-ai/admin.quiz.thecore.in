<template>
  <div class="about-page">
    <!-- Hero Section -->
    <header class="hero">
      <div class="hero-content">
        <h1>About the Website</h1>
        <p>
          Manage and create engaging quiz content using our robust platform. Explore the interactive highlights below to understand the core functionalities at a glance.
        </p>
      </div>
      <div class="hero-image">
        <!-- Replace the source with an actual illustration as needed -->
        <!-- <img src="https://via.placeholder.com/400x250.png?text=Admin+Dashboard" alt="Dashboard Illustration"> -->
      </div>
    </header>

    <!-- Interactive Flip Cards Section -->
    <section class="cards-section">
      <div class="card" v-for="(card, index) in cards" :key="index">
        <div class="card-inner">
          <div class="card-front">
            <h2>{{ card.title }}</h2>
          </div>
          <div class="card-back">
            <p>{{ card.content }}</p>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref } from 'vue'

// Define interactive flip card information
const cards = ref([
  {
    title: 'Dashboard Overview',
    content: 'Access comprehensive statistics and an overall view of all active quizzes and user engagement at a glance.'
  },
  {
    title: 'Quiz Management',
    content: 'Easily view, create, update, or delete quiz content. Monitor performance with interactive charts and detailed statistics.'
  },
  {
    title: 'User Engagement',
    content: 'Track participant interactions, quiz outcomes, and trends to continuously improve the quiz experience.'
  },
  {
    title: 'Data Insights',
    content: 'Leverage real-time analytics and visualizations to drive decisions and enhance content quality over time.'
  }
])
</script>

<style scoped>
/* General Page Styles */
.about-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  font-family: 'Poppins', sans-serif;
  background: #ffffff;
  color: #333;
}

/* Hero Section using modern gradient inspired by thecore.in */
.hero {
  display: flex;
  flex-direction: column;
  align-items: center;
  background: linear-gradient(135deg, #002b45, #007786);
  border-radius: 10px;
  padding: 40px 20px;
  color: #fff;
  gap: 20px;
  text-align: center;
  margin-bottom: 40px;
}
.hero-content h1 {
  font-size: 36px;
  margin-bottom: 10px;
}
.hero-content p {
  font-size: 18px;
  max-width: 800px;
}
.hero-image img {
  max-width: 100%;
  border-radius: 8px;
}

/* Cards Grid Layout */
.cards-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

/* Flip Card Styles */
.card {
  perspective: 1000px;
}
.card-inner {
  position: relative;
  width: 100%;
  height: 250px;
  text-align: center;
  transition: transform 0.8s;
  transform-style: preserve-3d;
  cursor: pointer;
}
.card:hover .card-inner {
  transform: rotateY(180deg);
}
.card-front,
.card-back {
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: 10px;
  backface-visibility: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}
.card-front {
  background: #f1f1f1;
  color: #002b45;
  border: 1px solid #ddd;
}
.card-front h2 {
  font-size: 20px;
}
.card-back {
  background: #007786;
  color: #fff;
  transform: rotateY(180deg);
  border: 1px solid #005f60;
  font-size: 16px;
  line-height: 1.4;
}

/* Responsive adjustments */
@media (min-width: 768px) {
  .hero {
    flex-direction: row;
    text-align: left;
    justify-content: space-between;
  }
  .hero-content {
    flex: 1;
  }
  .hero-image {
    flex: 1;
    display: flex;
    justify-content: center;
    align-items: center;
  }
}
</style>
