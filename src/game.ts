import * as ex from 'excalibur';
import { Dardo } from './actors/dardo';
import { HealthBar } from './actors/health-bar';

import { stats } from './stats';
import { Alvo } from './actors/alvo';
import Config from './config';

import { animManager } from './actors/animation-manager';

export class Game extends ex.Scene {

    engine: ex.Engine;
    questoes = [
      {
        pergunta: 'De qual período você mais gosta?',
        opcoes: [
          'Manhã',
          'Tarde',
          'Noite'
        ]
      },
      {
        pergunta: 'Qual seu lazer preferido?',
        opcoes: [
          'Ler',
          'Jogar',
          'Assistir'
        ]
      },
      {
        pergunta: 'Qual animal você mais gosta?',
        opcoes: [
          'Cachorro',
          'Gato',
          'Pássaros'
        ]
      }
    ];

    alvosAtuais: Array<Alvo> = [];
    rodadaAtual: number;
    questaoAtual: any;
    labelQuestao: ex.Label | undefined;

    respostasJogador: Array<{questao: any, respostaJogador: string}> = [];

    constructor(engine: ex.Engine) {
        super(engine);
        this.rodadaAtual = 1;
        this.engine = engine;
    }

    onInitialize(engine: ex.Engine) {
        engine.add(animManager);

        this.desenharDardo(engine);
        this.desenharBarraDeVida(engine);
        this.desenharPontuacao(engine);

        const gameOverLabel = new ex.Label("Fim de jogo", engine.halfDrawWidth - 250, engine.halfDrawHeight);
        gameOverLabel.color = ex.Color.Green.clone();
        gameOverLabel.scale = new ex.Vector(8,8);
        gameOverLabel.actions.blink(1000, 1000, 400).repeatForever();


        // sorteio uma questão
        // instancio 3 alvos enviando seus valores

        // let baddieTimer = new ex.Timer(() => {
        //     var bad = new Baddie(Math.random()*1000 + 200, -100, 80, 80);
        //     engine.add(bad);    
        // }, Config.spawnTime, true, -1);

        // engine.addTimer(baddieTimer);

        this.novaRodada();

        engine.on('preupdate', (evt: ex.PreUpdateEvent) => {
            if (stats.gameOver) {
                engine.add(gameOverLabel);
            }
        });

    }
    novaRodada() {
      this.questaoAtual = this.questoes[Math.floor((Math.random() * 10)) % this.questoes.length];

      let i = 0;

      this.labelQuestao?.kill();
      this.labelQuestao = new ex.Label(this.questaoAtual.pergunta, 400, 50);
      this.labelQuestao.color = ex.Color.White;
      this.labelQuestao.scale = new ex.Vector(4, 4);
      this.engine.add(this.labelQuestao);

      for (const opcao of this.questaoAtual.opcoes) {
        const alvo = new Alvo(400 + 200*i, 150, 80, 80, opcao, this.rodadaAtual, this.callback.bind(this));
        this.engine.add(alvo);
        this.alvosAtuais.push(alvo);
        i++;
      }
    }
    async callback(resposta: string) {
      console.log('resposta', resposta);
      // guardar resposta
      // matar os alvos
      // chamar nova rodada
      this.respostasJogador.push({questao: this.questaoAtual, respostaJogador: resposta});
      await this.limparOpcoes();
      this.rodadaAtual += 0.2;
      this.novaRodada();
    }

    desenharDardo(engine: ex.Engine) {
      const dardo = new Dardo(engine.halfDrawWidth, 800, 80, 80);
      engine.add(dardo);
    }

    desenharBarraDeVida(engine: ex.Engine) {
        const healthBar = new HealthBar();
        engine.add(healthBar);
    }

    desenharPontuacao(engine: ex.Engine) {
      const scoreLabel = new ex.Label("Pontuação: " + stats.score, 20, 50);
      scoreLabel.color = ex.Color.Azure;
      scoreLabel.scale = new ex.Vector(3, 3);
      scoreLabel.on('preupdate', function(this: ex.Label, evt){
          this.text = "Pontuação: " + stats.score;
      });
      engine.add(scoreLabel);
    }

    async limparOpcoes() {
      for (const alvo of this.alvosAtuais) {
        alvo.destroyOption();
      }  
      this.alvosAtuais.splice(0, this.alvosAtuais.length);
      return;
    }
}