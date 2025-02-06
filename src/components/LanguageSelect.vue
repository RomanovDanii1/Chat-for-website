<template>
  <div class="language-select-container">
    <label for="lang-select">{{ $t('languageLabel') }}:</label>
    <div class="custom-select-wrapper">
      <select id="lang-select" v-model="currentLanguage" @change="onChangeLanguage">
        <option v-for="item in languages" :key="item.value" :value="item.value">
          {{ item.label }}
        </option>
      </select>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

export default {
  name: 'LanguageSelect',
  setup() {
    const { locale } = useI18n();
    const languages = [
      { value: 'en', label: 'English' },
      { value: 'uk', label: 'Українська' },
      { value: 'de', label: 'Deutsch' }
    ];
    const currentLanguage = ref(locale.value);

    function onChangeLanguage() {
      locale.value = currentLanguage.value;
      localStorage.setItem('chatLang', currentLanguage.value);
    }

    return {
      languages,
      currentLanguage,
      onChangeLanguage
    };
  }
};
</script>

<style scoped>
.language-select-container {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px;
}

.language-select-container label {
  font-weight: bold;
  font-size: 14px;
}

.custom-select-wrapper {
  position: relative;
  border-radius: 4px;
  overflow: hidden;
}

.custom-select-wrapper select {
  appearance: none;
  padding: 6px 30px 6px 12px;
  font-size: 14px;
  border: 1px solid #ccc;
  border-radius: 4px;
  background-color: #fff;
  cursor: pointer;
}

.custom-select-wrapper select:focus {
  outline: none;
  border-color: #9A70FF;
}
</style>
