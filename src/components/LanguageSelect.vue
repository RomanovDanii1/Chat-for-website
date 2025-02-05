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
  background: url("data:image/svg+xml,%3Csvg%20width%3D'10'%20height%3D'6'%20viewBox%3D'0%200%2010%206'%20fill%3D'none'%20xmlns%3D'http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg'%3E%3Cpath%20d%3D'M5%200L0%206H10L5%200Z'%20fill%3D'%23aaa'%2F%3E%3C%2Fsvg%3E") no-repeat right 8px center / 10px 6px #fff;
  background-color: #fff;
  cursor: pointer;
}

.custom-select-wrapper select:focus {
  outline: none;
  border-color: #9A70FF;
}
</style>
