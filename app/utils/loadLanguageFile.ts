const loadLanguageFile = async (wantToLearn: string, fromLanguage: string, level: string) => {
    switch (`${wantToLearn}-${fromLanguage}-${level}`) {
      case 'english-german-a1':
        return require('../../languages/en/de/a1.json');
      case 'english-german-a2':
        return require('../../languages/en/de/a2.json');
      case 'english-german-b1':
        return require('../../languages/en/de/b1.json');
      case 'english-german-b2':
        return require('../../languages/en/de/b2.json');
      case 'english-german-c1':
        return require('../../languages/en/de/c1.json');
      case 'german-english-a1':
        return require('../../languages/de/en/a1.json');
      case 'german-english-a2':
        return require('../../languages/de/en/a2.json');
      case 'german-english-b1':
        return require('../../languages/de/en/b1.json');
      case 'german-english-b2':
        return require('../../languages/de/en/b2.json');
      case 'german-english-c1':
        return require('../../languages/de/en/c1.json');
      case 'english-russian-a1':
        return require('../../languages/en/ru/a1.json');
      case 'english-russian-a2':
        return require('../../languages/en/ru/a2.json');
      case 'english-russian-b1':
        return require('../../languages/en/ru/b1.json');
      case 'english-russian-b2':
        return require('../../languages/en/ru/b2.json');
      case 'english-russian-c1':
        return require('../../languages/en/ru/c1.json');
      case 'english-french-a1':
        return require('../../languages/en/fr/a1.json');
      case 'english-french-a2':
        return require('../../languages/en/fr/a2.json');
      case 'english-french-b1':
        return require('../../languages/en/fr/b1.json');
      case 'english-french-b2':
        return require('../../languages/en/fr/b2.json');
      case 'english-french-c1':
        return require('../../languages/en/fr/c1.json');
      case 'french-english-a1':
        return require('../../languages/fr/en/a1.json');
      case 'french-english-a2':
        return require('../../languages/fr/en/a2.json');
      case 'french-english-b1':
        return require('../../languages/fr/en/b1.json');
      case 'french-english-b2':
        return require('../../languages/fr/en/b2.json');
      case 'french-english-c1':
        return require('../../languages/fr/en/c1.json');
      case 'german-russian-a1':
        return require('../../languages/de/ru/a1.json');
      case 'german-russian-a2':
        return require('../../languages/de/ru/a2.json');
      case 'german-russian-b1':
        return require('../../languages/de/ru/b1.json');
      case 'german-russian-b2':
        return require('../../languages/de/ru/b2.json');
      case 'german-russian-c1':
        return require('../../languages/de/ru/c1.json');
      // Add more cases as needed for different languages and levels
      default:
        return require('../../languages/en/de/c1.json');
    }
  };
  
  export default loadLanguageFile;
  