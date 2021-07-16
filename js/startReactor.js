startReactor = {

  computerCombination: [],
  playerCombination: [],
  computerCombinationPosition: 1,
  combinationMaxPosition: 5,
  memoryMaxPosition: 9,

  audio: {

    start: 'start',
    fail: 'fail',
    complete: 'complete',
    combinations: ['0','1','2','3','4','5','6','7','8'],

    loadAudio(filename) {

      const file = `./audio/${filename}.mp3?cb=${(new Date).getTime()}`;
      const audio = new Audio(file);
      audio.load();
      return audio;

    },

    loadAudios() {

      if (typeof(this.start) == 'object') return;

      this.start = this.loadAudio(this.start); 
      this.fail = this.loadAudio(this.fail); 
      this.complete = this.loadAudio(this.complete); 
      this.combinations = this.combinations.map ( audio => this.loadAudio(audio)); 
    }

  },

  interface: {

    memoryPanel: document.querySelector('.computerMemory'),
    computerLedPanel: document.querySelector('.computerLed'),
    playerLedPanel: document.querySelector('.playerLed'),
    playerMemory: document.querySelector('.playerMemory'),
    playerMemoryButtons: document.querySelectorAll('.player_memory'),

    turnLedOn(index, ledPanel) {
      ledPanel.children[index].classList.add('ledOn')
    },

    turnAllLedsOff() {
      const computerLedPanel = this.computerLedPanel;
      const playerLedPanel = this.playerLedPanel;

      for (let i = 0; i < computerLedPanel.children.length; i++) {
        computerLedPanel.children[i].classList.remove('ledOn')
        playerLedPanel.children[i].classList.remove('ledOn')
      }
    },

    async start() {

      return startReactor.audio.start.play();

    },

    playItem(index, combinationPosition, location = 'computer') {

      const leds = (location=='computer') ? this.computerLedPanel : this.playerLedPanel ;
      const memPanel = this.memoryPanel.children[index];

      memPanel.classList.add('memoryActive');
      this.turnLedOn(combinationPosition, leds);
      startReactor.audio.combinations[index].play().then( () => {
        setTimeout( () => {
          memPanel.classList.remove('memoryActive');
        }, 150)
      })

    },

    endGame(type = 'fail') {

      const memPanel = this.memoryPanel;
      const ledPanel = this.computerLedPanel;
      const audio = (type == 'complete') ? startReactor.audio.complete: startReactor.audio.fail;
      const typeClasses = (type == 'complete') ? ['playerMemoryComplete', 'playerLedComplete']: ['playerMemoryError', 'playerLedError'];

      this.disableButtons()
      this.turnAllLedsOff()

      audio.play().then( () => {
        
        for(let i = 0; i < memPanel.children.length; i++) {
          if (memPanel.children[i].tagName == 'DIV') 
            memPanel.children[i].classList.add(typeClasses[0])
        }

        for(let i = 0; i < ledPanel.children.length; i++) {
          if (ledPanel.children[i].tagName == 'DIV') 
            ledPanel.children[i].classList.add(typeClasses[1])
        }

        setTimeout(() => {

          for(let i = 0; i < memPanel.children.length; i++) {
            if (memPanel.children[i].tagName == 'DIV') 
              memPanel.children[i].classList.remove(typeClasses[0])
          }
          for(let i = 0; i < ledPanel.children.length; i++) {
            if (ledPanel.children[i].tagName == 'DIV') 
              ledPanel.children[i].classList.remove(typeClasses[1])
          }
        }, 900)
        

      })

    },
    
    enableButtons() {

      const playerMemory = this.playerMemory;
      playerMemory.classList.add('playerActive')

      playerMemory.querySelectorAll('div').forEach(memory => memory.classList.add('playerMemoryActive'));

    },

    disableButtons() {

      const playerMemory = this.playerMemory;
      playerMemory.classList.remove('playerActive')

      playerMemory.querySelectorAll('div').forEach(memory => memory.classList.remove('playerMemoryActive'));

    },

  },

  async load() { 

    return new Promise(resolve => {
      this.audio.loadAudios();

      const playerMemory = this.interface.playerMemory;
      const memory = this.interface.playerMemoryButtons;

      memory.forEach(button => {
        
        button.addEventListener('click', () => {
          
          if (playerMemory.classList.contains('playerActive')) {
            this.play(parseInt(button.dataset.memory))

            button.style.animation = 'playerMemoryClick .4s'
            setTimeout(() => {
                button.style.animation = '';
            }, 400);
          }

        })

      });
    })

  },
  start() { 

    this.computerCombination = this.createCombination();
    this.computerCombinationPosition = 1;
    this.playerCombination = [];
    this.interface.start().then( () => {
      setTimeout(() => {
        this.playCombination();
      }, 500)
    })

  },

  createCombination() {

    let newCombination = [];
    for(let i = 0; i < this.combinationMaxPosition; i++) {
      const position = Math.floor(Math.random() * this.memoryMaxPosition + 1);
      newCombination.push(position-1)
    }
    return newCombination;
  },

  play(index) {

    this.interface.playItem(index, this.playerCombination.length, 'player');
    this.playerCombination.push(index);

    if (this.isTheRightCombination(this.playerCombination.length)) {

      if (this.playerCombination.length == this.combinationMaxPosition) {
        this.interface.endGame('complete');

        setTimeout(() => {
          this.start()
        }, 1200);
        return;
      }

      if (this.playerCombination.length == this.computerCombinationPosition) {
        this.computerCombinationPosition++;
        setTimeout(() => {
          this.playCombination()
        }, 1200);
      }

    } else {

      this.interface.endGame('fail');

      document.querySelector('#title').innerHTML = 'You are the imposter'
      setTimeout(() => {
        document.querySelector('#title').innerHTML = 'Start reactor'
        this.start();
      }, 1200);
      return;

    }

  },

  playCombination() {

    this.playerCombination = [];
    this.interface.disableButtons();
    this.interface.turnAllLedsOff();

    for (let i = 0; i < this.computerCombinationPosition; i++) {

      setTimeout(() => {
        this.interface.playItem(this.computerCombination[i], i)
      }, 400 * (i + 1));


      setTimeout(() => {
        
        this.interface.turnAllLedsOff();
        this.interface.enableButtons();

      }, 600 * (this.computerCombinationPosition));
    }
    
  },
  
  isTheRightCombination(position) {

    let computerCombination = this.computerCombination.slice(0, position);
    return (computerCombination.toString() == this.playerCombination.toString())

  }
}