const Alexa = require('ask-sdk-core');
const i18n = require('i18next');
const sprintf = require('i18next-sprintf-postprocessor');

// core functionality for fact skill
const GetNewFactHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    // checks request type
    return request.type === 'LaunchRequest'
      || (request.type === 'IntentRequest'
        && request.intent.name === 'GetNewFactIntent');
  },
  handle(handlerInput) {
    const requestAttributes = handlerInput.attributesManager.getRequestAttributes();
    // gets a random fact by assigning an array to the variable
    // the random item from the array will be selected by the i18next library
    // the i18next library is set up in the Request Interceptor
    const randomFact = requestAttributes.t('FACTS');
    // concatenates a standard message with the random fact
    const speakOutput = requestAttributes.t('GET_FACT_MESSAGE') + randomFact;

    return handlerInput.responseBuilder
      .speak(speakOutput)
      .withSimpleCard(requestAttributes.t('SKILL_NAME'), randomFact)
      .getResponse();
  },
};

const HelpHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest'
      && request.intent.name === 'AMAZON.HelpIntent';
  },
  handle(handlerInput) {
    const requestAttributes = handlerInput.attributesManager.getRequestAttributes();
    return handlerInput.responseBuilder
      .speak(requestAttributes.t('HELP_MESSAGE'))
      .reprompt(requestAttributes.t('HELP_REPROMPT'))
      .getResponse();
  },
};

const FallbackHandler = {
  // 2018-Aug-01: AMAZON.FallbackIntent is only currently available in en-* locales.
  //              This handler will not be triggered except in those locales, so it can be
  //              safely deployed for any locale.
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest'
      && request.intent.name === 'AMAZON.FallbackIntent';
  },
  handle(handlerInput) {
    const requestAttributes = handlerInput.attributesManager.getRequestAttributes();
    return handlerInput.responseBuilder
      .speak(requestAttributes.t('FALLBACK_MESSAGE'))
      .reprompt(requestAttributes.t('FALLBACK_REPROMPT'))
      .getResponse();
  },
};

const ExitHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest'
      && (request.intent.name === 'AMAZON.CancelIntent'
        || request.intent.name === 'AMAZON.StopIntent');
  },
  handle(handlerInput) {
    const requestAttributes = handlerInput.attributesManager.getRequestAttributes();
    return handlerInput.responseBuilder
      .speak(requestAttributes.t('STOP_MESSAGE'))
      .getResponse();
  },
};

const SessionEndedRequestHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'SessionEndedRequest';
  },
  handle(handlerInput) {
    console.log(`Session ended with reason: ${handlerInput.requestEnvelope.request.reason}`);
    return handlerInput.responseBuilder.getResponse();
  },
};

const ErrorHandler = {
  canHandle() {
    return true;
  },
  handle(handlerInput, error) {
    console.log(`Error handled: ${error.message}`);
    console.log(`Error stack: ${error.stack}`);
    const requestAttributes = handlerInput.attributesManager.getRequestAttributes();
    return handlerInput.responseBuilder
      .speak(requestAttributes.t('ERROR_MESSAGE'))
      .reprompt(requestAttributes.t('ERROR_MESSAGE'))
      .getResponse();
  },
};

const LocalizationInterceptor = {
  process(handlerInput) {
    // Gets the locale from the request and initializes 
    // i18next.
    const localizationClient = i18n.use(sprintf).init({
      lng: handlerInput.requestEnvelope.request.locale,
      resources: languageStrings,
    });
    // Creates a localize function to support arguments.
    localizationClient.localize = function localize() {
      // gets arguments through and passes them to
      // i18next using sprintf to replace string placeholders
      // with arguments.
      const args = arguments;
      const values = [];
      for (let i = 1; i < args.length; i += 1) {
        values.push(args[i]);
      }
      const value = i18n.t(args[0], {
        returnObjects: true,
        postProcess: 'sprintf',
        sprintf: values,
      });

      // If an array is used then a random value is selected 
      if (Array.isArray(value)) {
        return value[Math.floor(Math.random() * value.length)];
      }
      return value;
    };
    // this gets the request attributes and save the localize function inside 
    // it to be used in a handler by calling requestAttributes.t(STRING_ID, [args...])
    const attributes = handlerInput.attributesManager.getRequestAttributes();
    attributes.t = function translate(...args) {
      return localizationClient.localize(...args);
    };
  },
};

const skillBuilder = Alexa.SkillBuilders.custom();

exports.handler = skillBuilder
  .addRequestHandlers(
    GetNewFactHandler,
    HelpHandler,
    ExitHandler,
    FallbackHandler,
    SessionEndedRequestHandler,
  )
  .addRequestInterceptors(LocalizationInterceptor)
  .addErrorHandlers(ErrorHandler)
  .lambda();


// translations
// translations
const deData = {
  translation: {
    SKILL_NAME: 'Mit Liebe gemacht',
    GET_FACT_MESSAGE: 'Hier sind deine Fakten: ',
    HELP_MESSAGE: 'Sie können sagen, sagen Sie mir eine Liebes-Tatsache, oder, Sie können sagen, Ausgang ... Womit kann ich Ihnen helfen?',
    HELP_REPROMPT: 'Wie kann ich dir helfen?',
    FALLBACK_MESSAGE: 'Die Made With Love-Fertigkeit kann Ihnen dabei nicht helfen. Es kann Ihnen helfen, einige der interessantesten Fakten über Liebe und Beziehungen zu kennen. Womit kann ich dir helfen?',
    FALLBACK_REPROMPT: 'Wie kann ich dir helfen?',
    ERROR_MESSAGE: 'Es ist ein Fehler aufgetreten.',
    STOP_MESSAGE: 'Auf Wiedersehen!',
    FACTS:
      [
       'Monogame Beziehungen Existieren Im Gesamten Tierreich.',
'Es dauert nur bis zu 4 Minuten, um zu entscheiden, ob Sie jemanden mögen oder nicht.',
'Wenn Zwei Liebende Auf Die Augen Der Anderen Schauen, Synchronisieren Sich Ihre Herzfrequenzen.',
'Verlieben Hat Neurologische Wirkungen Ähnlich Denen Von Kokain.',
'Kuscheln Setzt Natürliche Schmerzmittel Frei.',
'Selbst Ein Blick Auf Ein Bild Eines Geliebten Menschen Lindert Den Schmerz.',
'Menschen Mit Gleicher Attraktivität Landen Eher Zusammen.',
'Paare, Die Einander Zu Ähnlich Sind, Werden Wahrscheinlich Nicht Dauern.',
'Romantische Liebe Endet Schließlich...Nur Um Von Engagierter Liebe Gefolgt Zu Werden.',
'Menschen, die Verliebt sind, haben Chemische Ähnlichkeiten Mit Menschen Mit OCD.',
'Das Denken An Liebe Und Sex Beeinflusst Kreativität Und Konkretes Denken.',
'Anhang + Pflege + Intimität = Perfekte Liebe.',
'Ein Attraktives Gesicht Wird Gegenüber Einem Attraktiven Körper Für Langfristige Beziehungen Bevorzugt.',
'Die Hand eines Geliebten Menschen zu halten Lindert Schmerzen Und Stress.',
'Dankbarkeit Gegenüber Menschen Auszudrücken, Die Du Liebst, Verursacht Einen Sofortigen Höhepunkt In Deinem Glück.',
'Erweiterte Schüler Zeigen Ihre Anziehungskraft Für Jemanden Und Macht Sie Attraktiver.',
'In Die Augen Der Anderen Zu Schauen, Kann Fremde Dazu Bringen, Sich Zu Verlieben.',
'Liebe Ist Wirklich Alles, Was Zählt.',
'Sowohl Männer als auch Frauen müssen ausreichend Testosteron für die sexuelle Anziehung haben.',
'Wir spüren und fühlen uns von einer person mit einem anderen Immunsystem angezogen.',
'Verlieben ist genauso süchtig wie Kokain oder Nikotin.',
'Liebe kann dich buchstäblich verrückt machen.',
'Liebe muss zum überleben\' blind \' sein.',
'Ihre Nervenzellen arbeiten besser im ersten Jahr der Liebe.',
'Romantische Liebe und die Liebe zwischen Mutter und Kind teilen eine ähnliche Chemische Verbindung.',
'Wenn Sie eines der wichtigsten \'bonding\' - Hormone wegnehmen, verschwindet die Befestigung.',
'Wir sind von denen angezogen, die Aussehen und / oder riechen ähnlich wie einer unserer Eltern.',
'Wir neigen auch dazu, uns in jemanden zu verlieben, der wie wir selbst aussieht.',
'Das Aufbrechen kann zu frustration führen, was dazu führen kann, dass die gedumpten den Dump noch mehr lieben.',
'Alle 13 Sekunden klagt ein Ehepaar in den USA wegen Scheidung.',
'Romantische Liebe dauert nur ein Jahr.',
'Soziale Medien ruinieren Beziehungen.',
'Herzschmerz kann dich krank machen.',
'Dein Herz kann buchstäblich brechen.',
'Die meisten Frauen sind von Männern angezogen, die einen starken Sinn für Humor besitzen, da er höhere Intelligenz und Ehrlichkeit anzeigt.',
'Wenn Sie Hände mit jemandem halten, den Sie lieben, kann es helfen, körperliche Schmerzen sowie stress und Angst zu lindern.',
'Wenn liebende einander in die Augen schauen, synchronisieren sich auch Ihre Herzfrequenzen.',
'Wenn du in fremde Augen schaust, kannst du dich tatsächlich verlieben.',
'Männer, die Ihre Partner betrügen, haben geringere IQs.',
'Wenn ein einzelner abgeworfen wird,kann es oft zu frustration führen. Diese Anziehungskraft macht die eine, die Liebe und lust die andere person noch mehr verlassen wurde.',
'Schlaf beraubte Männer gehen eher davon aus, dass Frauen sex mit Ihnen haben wollen.',
'Männer in Ihren frühen 20er Jahren fühlen nach einer Trennung mehr emotionale Schmerzen als Frauen.',
'Kuscheln löst die gleiche Menge neurologischer Reaktionen aus wie Schmerzmittel.',
'Menschen bevorzugen symmetrische Gesichter in Ihren Partnern, weil man unbewusst glaubt, dass Sie eine bessere Genetik haben.',
'Es dauert nur 2 bis 4 Minuten, um sich in jemanden zu verlieben.',
'Tränen von Frauen wurden biologisch nachgewiesen, um Testosteronspiegel und Erregung bei Männern zu reduzieren.',
'Nach 34 Minuten des Gesprächs weiß eine Frau bereits, ob es ein Potenzial gibt, eine langfristige Beziehung mit einem Mann zu haben oder nicht.',
'Wenn ein Mann jemanden attraktiv findet, kann er seinen Darm saugen, seine Muskeln beugen und Haltungen einnehmen, die ihn größer und stärker erscheinen lassen.',
'Als Folge der cortisol-Chemikalie in unserem Körper neigen wir dazu, unangemessen und irrational zu handeln, wenn wir auf jemanden fallen.',
'Wie sex und hunger ist der Drang, sich zu verlieben, primitiv und biologisch.',
'Bewusst versuchen, eine neue Beziehung geheim zu halten erhöht romantische Gefühle für einander.',
'Wenn zwei fremde gezwungen sind, für eine Weile zu sprechen und Blickkontakt zu halten, kann es Sie verlieben.',
'Wenn Sie eine neue Liebe betrachten, unterdrückt Ihr Gehirn den Instinkt, kritische soziale Urteile zu Fällen.',
'Dankbarkeit gegenüber Menschen auszudrücken, die du liebst, verursacht einen sofortigen Höhepunkt in deinem Glück.',
'Liebe verursacht auch einen Tropfen serotonin, das ein symptom von OCD ist, wodurch Sie buchstäblich besessen von Ihrem partner sind.',
'Im Durchschnitt verlieben sich die Menschen sieben mal, bevor Sie heiraten.',
'Ein Mann verbringt ein Jahr seines Lebens damit, seine Frauen anzustarren.',
'Menschen mit hohem Selbstwertgefühl haben längere und erfolgreichere Beziehungen.',
'Statistisch gesehen sind Männer schneller als Frauen zu sagen, ich Liebe dich in Beziehungen.',
'Studien berichten, dass Männer auch emotionaler betroffen sind, wenn Beziehungen enden.',
'Du verliebst dich am ehesten in jemanden, wenn du ihn zuerst in einer gefährlichen situation triffst.',
'Wenn man jemanden sieht, an dem man interessiert ist, fühlt man sich wie Schmetterlinge im Magen an, was eigentlich eine Stressreaktion ist, die durch Adrenalin verursacht wird.',
'Herzschmerz ist real, verworfen Funken starke Aktivität in den teilen des Gehirns mit körperlichen Schmerzen verbunden.',
'Männer, die morgens Ihre Frauen küssen, sollen fünf Jahre länger Leben als Männer, die nicht.',
'Liebe, oder zumindest Anziehung, kann auf den ersten Blick sein.',
'Jemandem nahe zu sein bedeutet nicht unbedingt, dass es so sein soll.',
'Liebe lässt dich den Fokus verlieren.',
      ],
  },
};

const dedeData = {
  translation: {
    SKILL_NAME: 'Mit Liebe gemacht (deutsche Version)',
  },
};


const enData = {
  translation: {
    SKILL_NAME: 'Made With Love',
    GET_FACT_MESSAGE: 'Here\'s your fact: ',
    HELP_MESSAGE: 'You can say tell me a love-based fact, or, you can say exit... What can I help you with?',
    HELP_REPROMPT: 'What can I help you with?',
    FALLBACK_MESSAGE: 'The Made With Love skill can\'t help you with that.  It can help you in knowing some of the most interesting facts based on love and relationships. What can I help you with?',
    FALLBACK_REPROMPT: 'What can I help you with?',
    ERROR_MESSAGE: 'Sorry, an error occurred.',
    STOP_MESSAGE: 'Goodbye!',
    FACTS:
      [
        'Monogamous Relationships Exist Throughout The Animal Kingdom.',
'It only takes up to 4 minutes to decide whether you like someone or not.',
'When Two Lovers Gaze At Each Others’ Eyes, Their Heart Rates Synchronize.',
'Falling In Love Has Neurological Effects Similar To Those Of Cocaine.',
'Cuddling Releases Natural Painkillers.',
'Even Looking At A Picture Of A Loved One Relieves The Pain.',
'People At The Same Level Of Attractiveness Are More Likely To End Up Together.',
'Couples Who Are Too Similar To Each Other Are Not Likely To Last.',
'Romantic Love Eventually Ends…Only To Be Followed By Committed Love.',
'People Who Are In Love Have Chemical Similarities With People With OCD.',
'Thinking Of Love And Sex Influences Creativity And Concrete Thinking, Respectively.',
'Attachment + Caring + Intimacy = Perfect Love.',
'An Attractive Face Is Preferred Over An Attractive Body For Long-Term Relationships.',
'Holding A Loved One’s Hand Relieves Pain And Stress.',
'Expressing Gratitude Towards People You Love Causes An Immediate Spike In Your Happiness.',
'Dilated Pupils Show Your Attraction To Someone And Makes You More Attractive.',
'Looking Into Each Others’ Eyes Can Make Strangers Fall In Love.',
'Love Is Really All That Matters.',
'Both males and females must have adequate testosterone for sexual attraction.',
'We can sense and are attracted to a person with a different immune system.',
'Falling in love is as addicting as cocaine or nicotine.',
'Love can literally make you crazy.',
'Love needs to be “blind” for survival.',
'Your nerve cells work better during the first year of love.',
'Romantic love and the love between a mother and child share a similar chemical connection.',
'When you take away one of the key “bonding” hormones, the attachment will disappear.',
'We are attracted to those who look and/or smell similar to one of our parents.',
'We also tend to fall in love with someone who looks like ourselves.',
'Breaking up may lead to frustration attraction, which can cause the dumped to love the dumpee even more.',
'Every 13 seconds, a couple in the U.S. files for divorce.',
'Romantic love lasts for only one year.',
'Social media is ruining relationships.',
'Heartbreak can actually make you sick.',
'Your heart can literally break.',
'Most women are attracted to men who possess a strong sense of humour as it indicates higher intelligence and honesty.',
'If you hold hands with someone you love, it can help alleviate physical pain as well as stress and fear.',
'When lovers gaze into each others eyes, their heart rates synchronize as well.',
'If you look into strangers eyes, you can actually fall in love.',
'Men who cheat on their partners have lower IQs.',
'When an individual is dumped, it can often result in frustration attraction. This attraction makes the one who was dumped love and lust the other person even more.',
'Sleep deprived men are more likely to assume that women want to have sex with them.',
'Men in their early 20s feel more emotional pain after a break up than women.',
'Cuddling triggers the same amount of neurological reactions as painkillers.',
'People prefer symmetrical faces in their partners because it is unconsciously believed that they have better genetics.',
'It takes only 2 to 4 minutes to fall in love for someone.',
'Tears of women have been biologically proven to reduce testosterone levels and arousal in men.',
'After 34 minutes of conversation, a woman already knows if there is a potential of having a long term relationship with a man or not.',
'When a man finds someone attractive, he may suck-in his gut, flex his muscles and take postures that make him appear taller and stronger.',
'As a result of the cortisol chemical in our body, we tend to act inappropriately and irrational when falling for someone.',
'Like sex and hunger, the urge to fall in love is primitive and biological.',
'Consciously trying to keep a new relationship secret heightens romantic feelings for each other.',
'When two strangers are forced to talk and maintain eye contact for a while, it can make them fall in love.',
'When you look at a new love, your brain suppresses the instinct to make critical social judgments.',
'Expressing gratitude toward people you love causes an immediate spike in your happiness.',
'Love also causes a drop in serotonin, which is a symptom of OCD, causing you to be literally obsessed with your partner.',
'On average, people fall in love seven times before getting married.',
'A man spends one year of his life staring at his women.',
'People with high self-esteem have longer and more successful relationships.',
'Statistically, men are quicker than women to say I love you in relationships.',
'Studies report that men are also more emotionally affected when relationships end.',
'You are most likely to fall in love with someone if you first meet them in a dangerous situation.',
'When you see someone you are interested in, what feels like butterflies in your stomach is actually a stress response caused by adrenaline.',
'Heartache is real, being rejected sparks strong activity in the parts of the brain associated with physical pain.',
'Men who kiss their wives in the morning are said to live five years longer than men who dont.',
'Love, or at least attraction, can be at first sight.',
'Being close to someone doesn’t necessarily mean it’s meant to be.',
'Love makes you lose your focus.',
      ],
  },
};

const enauData = {
  translation: {
    SKILL_NAME: 'Made With Love (Austrailian version)',
  },
};

const encaData = {
  translation: {
    SKILL_NAME: 'Made With Love (Canadian version)',
  },
};
const eninData = {
  translation: {
    SKILL_NAME: 'Made With Love (Indian version)',
  },
};

const engbData = {
  translation: {
    SKILL_NAME: 'Made With Love (British version)',
  },
};

const enusData = {
  translation: {
    SKILL_NAME: 'Made With Love (American version)',
  },
};

const esData = {
  translation: {
    SKILL_NAME: 'Hecho con amor',
    GET_FACT_MESSAGE: 'Aquí está tu curiosidad: ',
    HELP_MESSAGE: 'Puedes decir, dime un hecho basado en el amor, o, puedes decir salir ... ¿En qué puedo ayudarte?',
    HELP_REPROMPT: 'Como te puedo ayudar?',
    FALLBACK_MESSAGE: 'La habilidad Made With Love no puede ayudarte con eso. Puede ayudarte a conocer algunos de los hechos más interesantes basados ​​en el amor y las relaciones. ¿Como puedo ayudar??',
    FALLBACK_REPROMPT: 'Como te puedo ayudar?',
    ERROR_MESSAGE: 'Lo sentimos, se ha producido un error.',
    STOP_MESSAGE: 'Adiós!',
    FACTS:
        [
          'Las Relaciones Monogámicas Existen En Todo El Reino Animal.',
'Sólo toma hasta 4 minutos decidir si te gusta alguien o no.',
'Cuando Dos Amantes Se Miran A Los Ojos, Sus Pulsaciones Se Sincronizan.',
'Enamorarse Tiene Efectos Ramoógicos Similares A Los De La Cocaína.',
'Cuddling Libera Analgésicos Naturales.',
'Incluso Mirar Una Foto De Un Ser Querido Alivia El Dolor.',
'Las Personas En El Mismo Nivel De Atractivo Son Más Propensos A Terminar Juntos.',
'Las Parejas Que Son Demasiado Similares Entre Sí No Son Propensos A Durar.',
'El Amor Romántico Finalmente Termina...Sólo Para Ser Seguido Por El Amor Comprometido.',
'Las personas que están Enamoradas tienen similitudes químicas Con las Personas con TOC.',
'Pensar En El Amor Y El Sexo Influye En La Creatividad Y El Pensamiento Concreto, Respectivamente.',
'Apego + Cuidado + Intimidad = Amor Perfecto.',
'Una Cara Atractiva Es Preferida Sobre Un Cuerpo Atractivo Para Las Relaciones A Largo Plazo.',
'Sostener la mano de un ser Querido Alivia el dolor Y el Estrés.',
'Expresar Gratitud Hacia Las Personas Que Amas Causa Un Pico Inmediato En Tu Felicidad.',
'Las Pupilas Dilatadas Muestran Tu Atracción Hacia Alguien Y Te Hacen Más Atractivo.',
'Mirar A Los Ojos De Los Demás Puede Hacer Que Los Extraños Se Enamoren.',
'El Amor Es Lo Único Que Importa.',
'Tanto los hombres como las mujeres deben tener testosterona adecuada para la atracción sexual.',
'Podemos sentir y somos atraídos a una persona con un sistema inmunológico diferente.',
'Enamorarse es tan adictivo como la cocaína o la nicotina.',
'El amor puede darte de alta y volverte loco.',
'El amor necesita ser \'ciego\' para sobrevivir.',
'Tus neuronas funcionan mejor durante el primer año de amor.',
'El amor divertida y el amor entre una madre y un hijo comparten una conexión química similar.',
'Cuando te quites una de las hormonas clave de \'Unión\', el apego desaparecerá.',
'Nos sentimos atraídos por aquellos que se ven y/o huelen similar a uno de nuestros padres.',
'También tendemos a enamorarnos de alguien que se parece a nosotros mismos.',
'Romper puede llevar a la atracción de frustración, lo que puede hacer que el dumping a amar el dumping aún más.',
'Cada 13 segundos, una pareja en los Estados Unidos pide el divorcio.',
'El amor divertida dura sólo un año.',
'Las redes sociales están arruinando las relaciones.',
'El corazón roto puede hacerte enfermar.',
'Tu corazón puede dar de alta la ruptura.',
'La mayoría de las mujeres se sienten atraídas por hombres que poseen un fuerte sentido del humor, ya que indica una mayor inteligencia y honestidad.',
'Si te tomas de la mano con alguien que amas, puede ayudar a aliviar el dolor físico, así como el estrés y el miedo.',
'Cuando los amantes miran fijamente a los ojos de los demás, su ritmo cardíaco también se sincroniza.',
'Si miras a los ojos de los extraños, puedes enamorarte de verdad.',
'Los hombres que engañan a sus parejas tienen un coeficiente Intelectual más bajo.',
'Cuando un individuo es abandonado, a menudo puede resultar en la atracción de frustración. Esta atracción hace que el que fue abandonado el amor y la lujuria de la otra persona aún más.',
'Es más probable que los hombres que no duermen conseguidos que las mujeres quieren tener sexo con ellas.',
'Los hombres de veintipocos años sienten más dolor emocional después de una ruptura que las mujeres.',
'Caricias desencadena la misma cantidad de reacciones neurológicas como analgésicos.',
'La gente prefiere caras simétricas en sus parejas porque se cree inconscientemente que tienen mejor genética.',
'Sólo toma de 2 a 4 minutos Enamorarse de alguien.',
'Las lágrimas de las mujeres han sido biológicamente probadas para reducir los niveles de testosterona y la excitación en los hombres.',
'Después de 34 minutos de subir, una mujer ya sabe si existe la posibilidad de tener una relación a largo plazo con un hombre o no.',
'Cuando un hombre encuentra a alguien atractivo, puede succionar su aula, flexionar sus músculos y tomariaron que lo hacen parecer más alto y más fuerte.',
'Como resultado del químico de cortisol en nuestro cuerpo, tendemos a actuar inapropiada e irracional cuando nos enamoramos de alguien.',
'Como el sexo y el hambre, el impulso de Enamorarse es primitivo y biológico.',
'Tratar conscientemente de mantener una nueva relación en secreto aumenta los sentimientos románticos hacia el otro.',
'Cuando dos extraños se ven obligados a hablar y mantener el contacto Visual durante un tiempo, puede hacer que se enamoren.',
'Cuando miras a un nuevo amor, tu cerebro suprime el instinto de hacer juicios sociales críticos.',
'Expresar gratitud hacia la gente que amas causa un pico inmediato en tu felicidad.',
'El amor también causa una caída en la serotonina, que es un síntoma de OCD, causando que usted sea la descarga obsesionada con su pareja.',
'En promedio, la gente se enamora siete veces antes de casarse.',
'Un hombre pasa un año de su vida mirando a sus mujeres.',
'Las personas con alta autoestima tienen relaciones más largas y exitosas.',
'No hace falta, los hombres son más rápidos que las mujeres para decir te amo en las relaciones.',
'Los estudios informan que los hombres también se ven más afectados emocionalmente cuando las relaciones terminan.',
'Lo más probable es que te enamores de alguien si te encuentras con él en una situación peligrosa.',
'Cuando ves a alguien que te interesa, lo que se siente como recupera en el estómago es en realidad una respuesta de estrés causada por la adrenalina.',
'El dolor de corazón es real, el ser rechazado produce una fuerte actividad en las partes del cerebro asociadas con el dolor físico.',
'Se dice que los hombres que besan a sus esposas por la mañana viven cinco años más que los hombres que no lo hacen.',
'El amor, o al menos la atracción, puede ser a primera vista.',
'Estar cerca de alguien no significa necesariamente que esté destinado a estar.',
'El amor te hace perder la concentración.',
        ],
  },
};

const esesData = {
  translation: {
    SKILL_NAME: 'Hecho con amor (Version en español)',
  },
};

const esmxData = {
  translation: {
    SKILL_NAME: 'Hecho con amor (versión mexicana)',
  },
};

const frData = {
  translation: {
    SKILL_NAME: 'Fait avec amour',
    GET_FACT_MESSAGE: 'Voici votre anecdote : ',
    HELP_MESSAGE: 'Vous pouvez dire racontez-moi un fait fondé sur l\'amour, ou, vous pouvez dire sortie ... En quoi puis-je vous aider?',
    HELP_REPROMPT: 'Comment puis-je vous aider?',
    FALLBACK_MESSAGE: 'La compétence Made With Love ne peut pas vous aider avec ça. Cela peut vous aider à connaître certains des faits les plus intéressants basés sur l\'amour et les relations. En quoi puis-je vous aider?',
    FALLBACK_REPROMPT: 'Comment puis-je vous aider?',
    ERROR_MESSAGE: 'Désolé, une erreur est survenue.',
    STOP_MESSAGE: 'Au revoir!',
    FACTS:
        [
          'Des Relations Monogames Existent Dans Tout Le Royaume Animal.',
'Il ne prend que 4 minutes pour décider si vous aimez quelqu\'un ou pas.',
'Quand Deux Amants Se Regardent Les Yeux, Leur Rythme Cardiaque Se Synchronise.',
'Tomber Amoureux A Des Effets Neurologiques Similaires À Ceux De La Cocaïne.',
'Cuddling Libère Des Analgésiques Naturels.',
'Regarder Une Photo D\'Un Être Cher Soulage La Douleur.',
'Les Gens Au Même Niveau D\'Attractivité Sont Plus Susceptibles De Finir Ensemble.',
'Les Couples Qui Sont Trop Semblables Les Uns Aux Autres Ne Sont Pas Susceptibles De Durer.',
'L\'Amour Romantique Finit Par Finir ... Pour Être Suivi D\'Un Amour Dévoué.',
'Les gens qui sont amoureux ont des similitudes chimiques avec les gens atteints de TOC.',
'Penser À L\'Amour Et Au Sexe Influence La Créativité Et La Pensée Concrète, Respectivement.',
'Attachement + Compassion + Intimité = Amour Parfait.',
'Un Visage Attrayant Est Préférable À Un Corps Attrayant Pour Les Relations À Long Terme.',
'Tenir la main D\'un être cher soulage la douleur et le Stress.',
'Exprimer Sa Gratitude Envers Les Gens Que Vous Aimez Provoque Un Pic Immédiat Dans Votre Bonheur.',
'Les Pupilles Dilatées Montrent Votre Attirance Pour Quelqu\'Un Et Vous Rendent Plus Attirant.',
'Le Fait De Se Regarder Dans Les Yeux Peut Faire Tomber Des Étrangers Amoureux.',
'L\'Amour Est Vraiment Tout Ce Qui Compte.',
'Les hommes et les femmes doivent avoir une testostérone adéquate pour l\'attraction sexuelle.',
'Nous pouvons sentir et sommes attirés par une personne ayant un système immunitaire différent.',
'Tomber amoureux est aussi addictif que la cocaïne ou la nicotine.',
'L\'amour peut littéralement vous rendre fou.',
'L\'amour doit être” aveugle \' pour survivre.',
'Vos cellules nerveuses fonctionnent mieux pendant la première année de l\'amour.',
'L\'amour romantique et l\'amour entre une mère et l\'enfant partagent une substance similaire connexion.',
'Lorsque vous retirez l\'une des principales hormones” liantes\' , l\'attachement disparaîtra.',
'Nous sommes attirés par ceux qui ressemblent et/ou sentent comme l\'un de nos parents.',
'Nous avons aussi tendance à tomber amoureux de quelqu\'un qui nous ressemble.',
'Se séparer peut conduire à une attraction de frustration, qui peut amener le jeté à aimer encore plus la dumpee.',
'Toutes les 13 secondes, un couple aux États-Unis demande le divorce.',
'Romantique d\'amour ne dure qu\'un an.',
'Les médias sociaux ruinent les relations.',
'Chagrin peut effectivement vous rendre malade.',
'Ton cœur peut littéralement se briser.',
'La plupart des femmes sont attirées par des hommes qui possèdent un fort sens de l\'humour car il indique une plus grande intelligence et l\'honnêteté.',
'Si vous tenez la main de quelqu\'un que vous aimez, cela peut aider à soulager la douleur physique ainsi que le stress et la peur.',
'Quand les amoureux de la regarder dans les yeux, leur rythme cardiaque synchroniser.',
'Si vous regardez dans les yeux des étrangers, vous pouvez tomber en amour.',
'Les hommes qui trompent leur partenaire ont des QI plus bas.',
'Lorsqu\'une personne est larguée, cela peut souvent engendrer de la frustration. Cette attraction rend celui qui a été largué aimer et convoiter l\'autre personne encore plus.',
'Les hommes privés de sommeil sont plus susceptibles de supposer que les femmes veulent avoir des relations sexuelles avec eux.',
'Les hommes au début de la vingtaine ressentent plus de douleur émotionnelle après une rupture que les femmes.',
'Les câlins provoquent autant de réactions neurologiques que les analgésiques.',
'Les gens préfèrent les visages symétriques dans leurs partenaires parce qu\'on croit inconsciemment qu\'ils ont une meilleure génétique.',
'Il ne faut que 2 à 4 minutes pour tomber amoureux de quelqu\'un.',
'Les larmes des femmes ont été biologiquement prouvé pour réduire les niveaux de testostérone et l\'excitation chez les hommes.',
'Après 34 minutes de conversation, une femme sait déjà s\'il y a un potentiel d\'avoir une relation à long terme avec un homme ou non.',
'Quand un homme trouve quelqu\'un d\'attirant, Il peut sucer ses tripes, fléchir ses muscles et prendre des postures qui le font paraître plus grand et plus fort.',
'En conséquence de la cortisol chimiques dans notre corps, nous avons tendance à agir de façon inappropriée et irrationnelle lorsqu\'elle tombe pour quelqu\'un.',
'Comme le sexe et la faim, l\'envie de tomber en amour est primitif et biologiques.',
'Essayer consciemment de garder secret une nouvelle relation renforce les sentiments romantiques pour l\'autre.',
'Quand deux étrangers sont forcés de parler et de garder le contact visuel pendant un certain temps, cela peut les faire tomber amoureux.',
'Quand vous regardez un nouvel amour, votre cerveau supprime l\'instinct de faire de critique sociale jugements.',
'Exprimer sa gratitude envers les gens que vous aimez provoque un pic immédiat dans votre bonheur.',
'L\'amour provoque aussi une baisse de sérotonine, qui est un symptôme de TOC, ce qui vous amène à être littéralement obsédé par votre partenaire.',
'En moyenne, les gens tombent amoureux sept fois avant de se marier.',
'Un homme passe un an de sa vie à regarder ses femmes.',
'Les personnes qui ont une grande estime de soi ont des relations plus longues et plus fructueuses.',
'Statistiquement, les hommes sont plus rapides que les femmes à dire je t\'aime dans les relations.',
'Des études indiquent que les hommes sont aussi plus affectés émotionnellement lorsque les relations prennent fin.',
'Vous êtes le plus susceptible de tomber amoureux de quelqu\'un si vous rencontrez d\'abord dans une situation dangereuse.',
'Quand vous voyez quelqu\'un qui vous intéresse, ce qui ressemble à des papillons dans votre estomac est en fait une réponse de stress causé par l\'adrénaline.',
'Le chagrin est réel, être rejeté déclenche une forte activité dans les parties du cerveau associées à la douleur physique.',
'On dit que les hommes qui embrassent leur femme le matin vivent cinq ans de plus que les hommes qui ne le font pas.',
'L\'amour, ou au moins l\'attraction, peut-être à première vue.',
        ],
  },
};

const frfrData = {
  translation: {
    SKILL_NAME: 'Fait avec amour (Version française)',
  },
};

const itData = {
  translation: {
    SKILL_NAME: 'Fatto con amore',
    GET_FACT_MESSAGE: 'Ecco il tuo aneddoto: ',
    HELP_MESSAGE: 'Puoi dirmi un fatto basato sull\'amore o, puoi dire, uscire ... come posso aiutarti?',
    HELP_REPROMPT: 'Come posso aiutarti?',
    FALLBACK_MESSAGE: 'L\'abilità Made With Love non ti può aiutare. Può aiutarti a conoscere alcuni dei fatti più interessanti basati sull\'amore e le relazioni. Cosa posso fare per te?',
    FALLBACK_REPROMPT: 'Come posso aiutarti?',
    ERROR_MESSAGE: 'Spiacenti, si è verificato un errore.',
    STOP_MESSAGE: 'A presto!',
    FACTS:
      [
        'Esistono Relazioni Monogame In Tutto Il Regno Animale.',
'Ci vogliono solo 4 minuti per decidere se ti piace qualcuno o no.',
'Quando Due Amanti Si Guardano Gli Occhi, Il Loro Battito Cardiaco Si Sincronizza.',
'Innamorarsi Ha Effetti Neurologici Simili A Quelli Della Cocaina.',
'Le Coccole Rilasciano Antidolorifici Naturali.',
'Anche Guardare Una Foto Di Una Persona Amata Allevia Il Dolore.',
'Le Persone Allo Stesso Livello Di Attrattività Hanno Più Probabilità Di Ritrovarsi Insieme.',
'Le Coppie Troppo Simili Tra Loro Non Dureranno.',
'L\'Amore Romantico Alla Fine Finisce...Solo Per Essere Seguito Da Un Amore Devoto.',
'Le persone innamorate hanno delle somiglianze chimiche con le persone con il disturbo ossessivo compulsivo.',
'Il Pensiero Dell\'Amore E Del Sesso Influenza La Creatività E Il Pensiero Concreto, Rispettivamente.',
'Attaccamento + Cura + Intimità = Amore Perfetto.',
'Un Viso Attraente È Preferito A Un Corpo Attraente Per Le Relazioni A Lungo Termine.',
'Tenere la mano di una persona cara allevia il dolore e lo Stress.',
'Esprimere Gratitudine Verso Le Persone Che Ami Provoca Un Picco Immediato Nella Tua Felicita\'.',
'Le Pupille Dilatate Mostrano La Tua Attrazione Verso Qualcuno E Ti Rendono Piu \' Attraente.',
'Guardarsi Negli Occhi Puo \' Far Innamorare Gli Sconosciuti.',
'L\'Amore E \'Davvero Tutto Cio\' Che Conta.',
'Sia i maschi che le femmine devono avere testosterone adeguato per l\'attrazione sessuale.',
'Possiamo percepire e siamo attratti da una persona con un sistema immunitario diverso.',
'Innamorarsi e \' dipendente dalla cocaina o dalla nicotina.',
'L\'amore puo \' letteralmente farti impazzire.',
'L\'amore deve essere \'cieco\' per sopravvivere.',
'Le tue cellule nervose funzionano meglio durante il primo anno d\'amore.',
'Amore romantico e l\'amore tra una madre e un bambino condividono una connessione chimica simile.',
'Quando togli uno degli ormoni chiave del” legame\', l\'attaccamento sparira\'.',
'Siamo attratti da coloro che guardano e/o odorano simili a uno dei nostri genitori.',
'Tendiamo anche ad innamorarci di qualcuno che assomiglia a noi stessi.',
'Rompere puo \'portare a un\'attrazione frustrante, il che puo \'far si\' che gli scaricati amino ancora di piu \' la discarica.',
'Ogni 13 secondi, un paio di file negli Stati Uniti per il divorzio.',
'L\'amore romantico dura solo un anno.',
'I Social media stanno rovinando le relazioni.',
'Il cuore spezzato puo \' farti star male.',
'Il tuo cuore puo \' letteralmente spezzarsi.',
'La maggior parte delle donne sono attratte da uomini che hanno un forte senso dell\'umorismo, in quanto indica una maggiore intelligenza e onestà.',
'Se si tiene per mano qualcuno che si ama, può aiutare ad alleviare il dolore fisico, così come lo stress e la paura.',
'Quando gli amanti si guardano negli occhi, anche il loro battito cardiaco si sincronizza.',
'Se guardi negli occhi degli sconosciuti, puoi davvero innamorarti.',
'Gli uomini che tradiscono i loro partner hanno Qi inferiori.',
'Quando un individuo viene scaricato, spesso può causare attrazione di frustrazione. Questa attrazione rende ancora di più chi è stato scaricato dall\'amore e dalla lussuria l\'altra persona.',
'Gli uomini privi di sonno sono più propensi a supporre che le donne vogliono fare sesso con loro.',
'Gli uomini sulla ventina provano piu \' dolore emotivo dopo una rottura che le donne.',
'Le coccole provocano la stessa quantita \' di reazioni neurologiche degli antidolorifici.',
'La gente preferisce le facce simmetriche nei propri partner perché è inconsapevolmente creduto di avere una genetica migliore.',
'Ci vogliono solo 2 o 4 minuti per innamorarsi di qualcuno.',
'Lacrime di donne sono stati biologicamente dimostrato di ridurre i livelli di testosterone e l\'eccitazione negli uomini.',
'Dopo 34 minuti di conversazione, una donna sa gia \'se esiste la possibilita\' di avere una relazione a lungo termine con un uomo o no.',
'Quando un uomo trova qualcuno di attraente, può risucchiarsi l\'intestino, flettere i muscoli e prendere posizioni che lo fanno apparire più alto e più forte.',
'A causa della sostanza chimica del cortisolo nel nostro corpo, tendiamo ad agire in modo inappropriato e irrazionale quando ci innamoriamo di qualcuno.',
'Come il sesso e la fame, la voglia di innamorarsi e \' primitiva e biologica.',
'Cercare consapevolmente di mantenere segreta una nuova relazione aumenta i sentimenti romantici l\'uno per l\'altra.',
'Quando due sconosciuti sono costretti a parlare e a mantenere il contatto visivo per un po\', puo \' farli innamorare.',
'Quando guardi un nuovo amore, il tuo cervello sopprime l\'istinto di esprimere giudizi sociali critici.',
'Esprimere gratitudine verso le persone che ami provoca un picco immediato nella tua Felicita\'.',
'L\'amore causa anche una goccia di serotonina, che è un sintomo di OCD, causando di essere letteralmente ossessionato con il vostro partner.',
'In media, le persone si innamorano sette volte prima di sposarsi.',
'Un uomo passa un anno della sua vita a fissare le sue donne.',
'Le persone con alta autostima hanno relazioni più lunghe e di maggior successo.',
'Statisticamente, gli uomini sono piu \' veloci delle donne a dire che ti amo nelle relazioni.',
'Studi riferiscono che gli uomini sono anche più emotivamente interessati quando le relazioni finiscono.',
'E \' molto probabile che ti innamori di qualcuno se lo incontri per la prima volta in una situazione pericolosa.',
'Quando vedi qualcuno che ti interessa, quello che ti sembra una farfalla nello stomaco è in realtà una risposta allo stress causata dall\'adrenalina.',
'Il mal di cuore e\' reale, essere respinti provoca una forte attivita \' nelle parti del cervello associate al dolore fisico.',
'Si dice che gli uomini che si baciano le mogli al mattino vivano cinque anni più di quelli che non lo fanno.',
'L\'amore, o almeno l\'attrazione, puo \' essere a prima vista.',
'Stare vicino a qualcuno non significa necessariamente che sia Destino.',
'L\'amore ti fa perdere la concentrazione.',
      ],
  },
};

const ititData = {
  translation: {
    SKILL_NAME: 'Fatto con amore (versione italiana)',
  },
};

const jpData = {
  translation: {
    SKILL_NAME: '愛を込めて作られ',
    GET_FACT_MESSAGE: '知ってましたか？',
    HELP_MESSAGE: 'あなたは私に愛に基づいた事実を言うことができる、または、あなたは終了を言うことができます...私はあなたを手伝って何ができますか？',
    HELP_REPROMPT: 'どうしますか？',
    ERROR_MESSAGE: '申し訳ありませんが、エラーが発生しました',
    STOP_MESSAGE: 'さようなら',
    FACTS:
      [
        '一夫一婦制の関係は、動物界全体に存在します。',
'それはあなたが誰かを好きかどうかを決定するために4分までかかります。',
'二人の恋人がお互いの目を凝視すると、彼らの心拍数が同期します。',
'恋に落ちることはコカインのそれらに類似した神経学的な効果をもたらす。',
'抱きしめることは自然な鎮痛剤を解放する。',
'愛する人の絵を見ても、痛みを和らげます。',
'魅力の同じレベルの人々は一緒に終わる可能性が高くなります。',
'お互いにあまりにも似ているカップルは続く可能性はありません。',
'ロマンチックな愛は結局...託された愛に先行しているただ終える。',
'愛にある人々にOCDの人々との化学類似があります。',
'愛とセックスの思考は、それぞれ、創造性と具体的な思考に影響を与えます。',
'添付ファイル+思いやり+親密=完璧な愛。',
'魅力的な顔は、長期的な関係のために魅力的なボディよりも好ましい。',
'愛する人の手を保持すると、痛みやストレスを軽減します。',
'お礼に向けて人を愛す原因となる当面のスパイクに幸せです。',
'拡張された生徒は、誰かにあなたの魅力を示し、あなたがより魅力的になります。',
'お互いの目を見ると、見知らぬ人が恋に落ちることがあります。',
'愛は本当にすべての事項です。',
'男女必要十分なテストステロンのための性的魅力です。',
'我々は感知することができ、異なる免疫システムを持つ人に魅了されています。',
'恋に落ちるコカインやニコチンとして中毒です。',
'愛は文字通りあなたを狂わせます。',
'愛は生存のために\'盲目\'である必要があります。',
'あなたの神経細胞は、愛の最初の年の間に良い仕事します。',
'ロマンチックな愛と母と子の間の愛は、同様の化学的な接続を共有しています。',
'あなたは重要な\'結合\'ホルモンのいずれかを奪うとき、添付ファイルが消えます。',
'私たちは、両親のように見たり、匂いを嗅ぐ人たちに引き付けられます。',
'私たちはまた、自分自身のように見える人と恋に落ちる傾向があります。',
'解体は、さらに多くのダンピーを愛するようにダンプを引き起こす可能性が欲求不満の魅力、につながる可能性があります。',
'13秒ごとに、米国のカップルは離婚のためにファイルします。',
'ロマンチックな愛はたった一年間続きます。',
'のソーシャルメディアに対する損なう関係します。',
'失恋は実際に病気にすることができます。',
'あなたの心は文字通り壊れます。',
'ほとんどの女性はより高い知性および正直者を示すのでユーモアの強い感覚を所有している人に引き付けられる。',
'あなたが愛する誰かと手を握れば、それは物理的な苦痛、また圧力および恐れの軽減を助けることができる。',
'恋人がお互いの目を凝視すると、彼らの心拍数も同期します。',
'まう人の目で実際に恋に落ちます。',
'彼らのパートナーでごまかす人はより低いIqを持っている。',
'個人が投げ出されるとき、頻繁に欲求不満の魅力で起因できる。 このアトラクションは、さらに多くの愛と欲望他の人をダンプされたものになります。',
'睡眠不足の男性は、女性が彼らとセックスをしたいと仮定する可能性が高くなります。',
'彼らの20代前半の男性は女性よりもブレークアップした後、より感情的な痛みを感じます。',
'抱きしめることは鎮痛剤として神経学的な反作用の同量を誘発する。',
'人好みの対称面にパートナーですので無意識のうちにとってより良い可能性を探りました。',
'それは誰かのために恋に落ちるためにわずか2-4分かかります。',
'女性の涙は、男性のテストステロンレベルと覚醒を低下させることが生物学的に証明されています。',
'後34会話の分,男かどうかとの長期的な関係を持つ可能性がある場合、女性はすでに知っています。.',
'男は誰かが魅力的見つけたとき,彼は吸うことができます-彼の腸に,彼の筋肉を曲げると、彼は背が高く、強く見えるように姿勢を取ります.',
'私たちの体内のコルチゾール化学物質の結果として、私たちは誰かのために落ちるときに不適切かつ非合理的に行動する傾向があります。',
'セックスと飢餓のように、恋に落ちる衝動は原始的で生物学的なものです。',
'を意識さを保つよう心掛けて新しい関係の秘密の恋心を高めてきました。',
'この時、二人は強い相手の目をじっと見つかっていただけるのか\'恋をします。',
'あなたは新しい愛を見てみると、あなたの脳は、重要な社会的判断を行うために本能を抑制します。',
'お礼に向けて人を愛す原因となる当面のスパイクに幸せです。',
'愛はまた、OCDの症状であるセロトニンの低下を引き起こし、あなたは文字通りあなたのパートナーに夢中になります。',
'平均して、人々は結婚する前に七回恋に落ちます。',
'男は彼の女性を見つめ、彼の人生の一年を費やしています。',
'高い自尊心を持つ人々は、より長く、より成功した関係を持っています。',
'統計的には、男性は私が関係であなたを愛していると言うために女性よりも速いです。',
'調査は関係がいつ終わるか人がまたより感情的に影響されることを報告する。',
'あなたが最初に危険な状況でそれらを満たしている場合、あなたは誰かと恋に落ちる可能性が最も高いです。',
'がんの人が興味を持ったように感じてしまう蝶のお腹のあるストレス応答によるアドレナリンです。',
'心痛は本当である、拒否されている物理的な痛みに関連付けられている脳の部分で強力な活動を火花します。',
'朝に自分の妻にキスをした男性はいけない人よりも五年長生きすると言われています。',
'愛、または少なくとも魅力は、一目ですることができます。',
'に近い人になれるようにサポートをしている\'ことを意味します。',
'愛はあなたの焦点を失わせる。',
      ],
  },
};

const jpjpData = {
  translation: {
    SKILL_NAME: '愛を込めて作られ (日本語版)',
  },
};

const ptData = {
  translation: {
    SKILL_NAME: 'Feito com amor',
    GET_FACT_MESSAGE: 'Aqui vai: ',
    HELP_MESSAGE: 'Você pode dizer-me um fato baseado no amor, ou você pode dizer "sair" ... Com o que posso ajudá-lo?',
    HELP_REPROMPT: 'O que vai ser?',
    FALLBACK_MESSAGE: 'A habilidade Made With Love não pode ajudá-lo com isso. Pode ajudá-lo a conhecer alguns dos fatos mais interessantes baseados em amor e relacionamentos. Com o que posso ajudar?',
    FALLBACK_REPROMPT: 'Eu posso contar fatos sobre o espaço. Como posso ajudar?',
    ERROR_MESSAGE: 'Desculpa, algo deu errado.',
    STOP_MESSAGE: 'Tchau!',
    FACTS:
      [
'As Relações Monogâmicas Existem Em Todo O Reino Animal.',
'Só demora 4 minutos a decidir se gostas ou não de alguém.',
'Quando Dois Amantes Olham Para Os Olhos Um Do Outro, Os Seus Batimentos Cardíacos Sincronizam-Se.',
'Apaixonar - Se Tem Efeitos Neurológicos Semelhantes Aos Da Cocaína.',
'Os Abraços Libertam Analgésicos Naturais.',
'Mesmo Olhando Para Uma Foto De Um Ente Querido Alivia A Dor.',
'É Mais Provável Que As Pessoas Do Mesmo Nível De Atractividade Acabem Juntas.',
'Os Casais Que São Demasiado Semelhantes Uns Aos Outros Não São Susceptíveis De Durar.',
'O Amor Romântico Acaba ... Só Para Ser Seguido Por Amor Comprometido.',
'As pessoas que estão apaixonadas têm semelhanças químicas com pessoas com TOC.',
'O Pensamento Do Amor E Do Sexo Influencia A Criatividade E O Pensamento Concreto, Respectivamente.',
'Apego + Carinho + Intimidade = Amor Perfeito.',
'Um Rosto Atraente É Preferido A Um Corpo Atraente Para Relações De Longo Prazo.',
'Segurar a mão de um ente querido alivia a dor e o Stress.',
'Expressar Gratidão Para Com As Pessoas Que Amas Causa Um Aumento Imediato Na Tua Felicidade.',
'Pupilas Dilatadas Mostram A Tua Atracção Por Alguém E Tornam-Te Mais Atraente.',
'Olhar Nos Olhos Uns Dos Outros Pode Fazer Com Que Estranhos Se Apaixonem.',
'O Amor É Realmente Tudo O Que Importa.',
'Tanto homens como mulheres devem ter testosterona adequada para atracção sexual.',
'Nós podemos sentir e somos atraídos por uma pessoa com um sistema imunológico diferente.',
'Apaixonar-se é tão viciante como cocaína ou nicotina.',
'O amor pode literalmente enlouquecer-nos.',
'O amor precisa de ser \'cego\' para sobreviver.',
'As células nervosas funcionam melhor durante o primeiro ano de amor.',
'O amor romântico e o amor entre uma mãe e uma criança partilham uma ligação química semelhante.',
'Quando se tira uma das hormonas chave de ligação, a ligação desaparece.',
'Nós somos atraídos por aqueles que olham e / ou cheiram semelhante a um de nossos pais.',
'Nós também tendemos a nos apaixonar por alguém que se parece com nós mesmos.',
'Separar - se pode levar à frustração, o que pode fazer com que os despejados amem ainda mais o dumpee.',
'A cada 13 segundos, um casal nos ficheiros dos EUA para o divórcio.',
'O amor romântico dura apenas um ano.',
'As redes sociais estão a arruinar as relações.',
'O desgosto pode mesmo fazer-te ficar doente.',
'O teu coração pode literalmente partir-se.',
'A maioria das mulheres sentem-se atraídas por homens que possuem um forte sentido de humor, uma vez que indica maior inteligência e honestidade.',
'Se der as mãos a alguém que ama, pode ajudar a aliviar a dor física, bem como o stress e o medo.',
'Quando os amantes olham uns para os outros, os seus batimentos cardíacos também se sincronizam.',
'Se olhares nos olhos de estranhos, podes apaixonar-te.',
'Os homens que enganam os parceiros têm QI mais baixos.',
'Quando um indivíduo é despejado, muitas vezes pode resultar em atração de frustração. Esta atração faz com que aquele que foi abandonado amor e luxúria a outra pessoa ainda mais.',
'Os homens sem sono são mais propensos a assumir que as mulheres querem ter sexo com eles.',
'Os homens com 20 e poucos anos sentem mais dor emocional depois de uma separação do que as mulheres.',
'Abraçar provoca a mesma quantidade de reacções neurológicas que os analgésicos.',
'As pessoas preferem rostos simétricos em seus parceiros porque é inconscientemente acreditado que eles têm melhor genética.',
'Só demora 2 a 4 minutos a apaixonar-se por alguém.',
'Lágrimas de mulheres têm sido biologicamente comprovadas para reduzir os níveis de testosterona e excitação nos homens.',
'Depois de 34 minutos de conversa, uma mulher já sabe se existe o potencial de ter uma relação de longo prazo com um homem ou não.',
'Quando um homem encontra alguém atraente, ele pode sugar-em seu intestino, flexionar seus músculos e tomar posturas que o fazem parecer mais alto e mais forte.',
'Como resultado do produto químico cortisol no nosso corpo, tendemos a agir inapropriadamente e irracional quando nos apaixonamos por alguém.',
'Como o sexo e a fome, o desejo de se apaixonar é primitivo e biológico.',
'Conscientemente, tentar manter um novo relacionamento secreto aumenta os sentimentos românticos um pelo outro.',
'Quando dois estranhos são forçados a falar e manter contato visual por um tempo, isso pode fazê-los se apaixonar.',
'Quando você olha para um novo amor, seu cérebro suprime o instinto de fazer julgamentos sociais críticos.',
'Expressar gratidão pelas pessoas que amas causa um aumento imediato na tua felicidade.',
'O amor também causa uma queda na serotonina, que é um sintoma de TOC, fazendo com que você esteja literalmente obcecado com o seu parceiro.',
'Em média, as pessoas apaixonam-se sete vezes antes de se casarem.',
'Um homem passa um ano da sua vida a olhar para as suas mulheres.',
'As pessoas com alta auto-estima têm relacionamentos mais longos e mais bem sucedidos.',
'Estatisticamente, os homens são mais rápidos do que as mulheres a dizer que te amo nas relações.',
'Estudos relatam que os homens também são mais emocionalmente afetados quando as relações acabam.',
'É mais provável que te apaixones por alguém se o encontrares pela primeira vez numa situação perigosa.',
'Quando você vê alguém em quem você está interessado, o que se sente como borboletas em seu estômago é na verdade uma resposta ao estresse causada pela adrenalina.',
'A dor de coração é real, sendo rejeitada provoca forte actividade nas partes do cérebro associadas à dor física.',
'Dizem que os homens que beijam as mulheres de manhã vivem mais cinco anos do que os homens que não o fazem.',
'O amor, ou pelo menos a atracção, pode ser à primeira vista.',
'Estar perto de alguém não significa necessariamente que esteja destinado.',
'O amor faz-nos perder a concentração.',
      ],
  },
};

// constructs i18n and l10n data structure
// translations for this sample can be found at the end of this file
const languageStrings = {
  'de': deData,
  'de-DE': dedeData,
  'en': enData,
  'en-AU': enauData,
  'en-CA': encaData,
  'en-GB': engbData,
  'en-US': enusData,
  'es': esData,
  'en-In': eninData,
  'es-ES': esesData,
  'es-MX': esmxData,
  'fr': frData,
  'fr-FR': frfrData,
  'it': itData,
  'it-IT': ititData,
  'ja': jpData,
  'ja-JP': jpjpData,
  'pt': ptData,
  'pt-BR': ptData
};
