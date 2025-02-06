<template>
  <div class="credits-container">
    <div class="glow-box">
      <p class="signature">Gemacht von</p>
      <h3 class="author-name">Daniil Romanov</h3>
      <a href="mailto:romanovvv90@gmail.com" class="author-email">romanovvv90@gmail.com</a>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Credits',
};
</script>

<style scoped>
.credits-container {
  margin: 20px auto;
  display: flex;
  justify-content: center;
  align-items: center;
}

.glow-box {
  background: linear-gradient(45deg, #f5f5f5, #ffffff);
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 0 20px rgba(170, 70, 255, 0.3);
  text-align: center;
  max-width: 280px;
  transition: transform 0.3s;
}
.glow-box:hover {
  transform: translateY(-2px) scale(1.02);
  box-shadow: 0 0 30px rgba(170, 70, 255, 0.5);
}

.signature {
  margin: 0;
  font-size: 14px;
  font-style: italic;
  color: #555;
}

.author-name {
  margin: 8px 0 4px 0;
  font-weight: 600;
  font-size: 18px;
  color: #6f42c1;
}

.author-email {
  display: inline-block;
  color: #6f42c1;
  text-decoration: none;
  font-size: 14px;
  margin-top: 4px;
}
.author-email:hover {
  text-decoration: underline;
}
</style>
