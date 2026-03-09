export const recoveryQuestions = [
  "What’s your best friend name?",
  "What’s your first pet's name?",
  "What is your most loved one name?",
  "What is your favorite food?",
  "What sport you love to watch?",
  "What’s your crush name?",
  "Tell me a secret in a word.",
  "What’s your favorite animal?",
  "What defines you in one word?",
];

export type MentalHealthTopic = {
  id: string;
  name: string;
  shortDescription: string;
  symptoms: string[];
  videoId: string;
};

export type HelpGuide = {
  heading: string;
  solutions: string[];
  resource: {
    title: string;
    url: string;
    source: string;
  };
};

const careSentence =
  "If you feel all of these symptoms, please seek help, talk to your loved ones or visit a psychiatrist nearby, please take care of yourself.";

export const mentalHealthTopics: MentalHealthTopic[] = [
  { id: "anxiety", name: "Anxiety Disorders", shortDescription: `High fear and worry that are hard to control. ${careSentence}`, symptoms: ["Excessive worry", "Restlessness", "Muscle tension", "Sleep disturbance"], videoId: "WWloIAQpMcQ" },
  { id: "panic", name: "Panic Disorder", shortDescription: `Sudden intense fear episodes with body symptoms. ${careSentence}`, symptoms: ["Racing heart", "Breathlessness", "Shaking", "Fear of dying"], videoId: "nS8Lim2OlK0" },
  { id: "social-anxiety", name: "Social Anxiety Disorder", shortDescription: `Strong fear of social judgment and embarrassment. ${careSentence}`, symptoms: ["Avoiding social settings", "Blushing/sweating", "Fear of speaking", "Post-event rumination"], videoId: "YmM22eRjvCk" },
  { id: "gad", name: "Generalized Anxiety Disorder", shortDescription: `Persistent worry about many life areas. ${careSentence}`, symptoms: ["Chronic worry", "Irritability", "Fatigue", "Poor concentration"], videoId: "WWloIAQpMcQ" },
  { id: "phobia", name: "Specific Phobias", shortDescription: `Intense fear of specific objects/situations. ${careSentence}`, symptoms: ["Immediate fear response", "Avoidance", "Panic-like symptoms", "Life restriction"], videoId: "rWvSmf7YFKo" },
  { id: "agoraphobia", name: "Agoraphobia", shortDescription: `Fear of situations where escape feels difficult. ${careSentence}`, symptoms: ["Avoiding crowded places", "Avoiding public transport", "Fear outside home", "Dependence on companion"], videoId: "L8IPrBG6ibw" },
  { id: "ocd", name: "Obsessive-Compulsive Disorder (OCD)", shortDescription: `Intrusive thoughts and repetitive behaviors. ${careSentence}`, symptoms: ["Obsessions", "Compulsions", "Time-consuming rituals", "Distress if interrupted"], videoId: "DhlRgwdDc-E" },
  { id: "ptsd", name: "Post-Traumatic Stress Disorder (PTSD)", shortDescription: `Trauma-related re-experiencing and hyperarousal. ${careSentence}`, symptoms: ["Flashbacks/nightmares", "Avoidance", "Hypervigilance", "Emotional numbness"], videoId: "b_n9qegR7C4" },
  { id: "acute-stress", name: "Acute Stress Disorder", shortDescription: `Short-term trauma reaction in early weeks. ${careSentence}`, symptoms: ["Dissociation", "Intrusive memories", "Anxiety", "Sleep disturbance"], videoId: "b_n9qegR7C4" },
  { id: "depression", name: "Major Depressive Disorder", shortDescription: `Persistent low mood and reduced interest. ${careSentence}`, symptoms: ["Low mood", "Anhedonia", "Low energy", "Appetite/sleep changes"], videoId: "XiCrniLQGYc" },
  { id: "pdd", name: "Persistent Depressive Disorder", shortDescription: `Long-lasting lower-grade depression symptoms. ${careSentence}`, symptoms: ["Chronic sadness", "Low self-esteem", "Hopelessness", "Poor energy"], videoId: "XiCrniLQGYc" },
  { id: "bipolar-1", name: "Bipolar I Disorder", shortDescription: `Episodes of mania and depression. ${careSentence}`, symptoms: ["Elevated mood", "Reduced sleep need", "Risky behavior", "Depressive episodes"], videoId: "KSvk8LLBo2g" },
  { id: "bipolar-2", name: "Bipolar II Disorder", shortDescription: `Hypomania with major depressive episodes. ${careSentence}`, symptoms: ["Hypomanic periods", "Depressive episodes", "Mood swings", "Functional disruption"], videoId: "KSvk8LLBo2g" },
  { id: "cyclothymia", name: "Cyclothymic Disorder", shortDescription: `Long-term mood instability below bipolar thresholds. ${careSentence}`, symptoms: ["Frequent mood shifts", "Energy variability", "Irritability", "Low/high spells"], videoId: "KSvk8LLBo2g" },
  { id: "schizophrenia", name: "Schizophrenia Spectrum Disorders", shortDescription: `Disturbances in perception, thought, and behavior. ${careSentence}`, symptoms: ["Delusions", "Hallucinations", "Disorganized speech", "Negative symptoms"], videoId: "nEnklxGAmak" },
  { id: "delusional", name: "Delusional Disorder", shortDescription: `Persistent delusions with less overall disorganization. ${careSentence}`, symptoms: ["Fixed false beliefs", "Suspiciousness", "Behavior tied to delusion", "Social conflict"], videoId: "nEnklxGAmak" },
  { id: "adhd", name: "Attention-Deficit/Hyperactivity Disorder (ADHD)", shortDescription: `Attention regulation and impulse-control difficulties. ${careSentence}`, symptoms: ["Inattention", "Impulsivity", "Hyperactivity", "Poor task completion"], videoId: "ouZrZa5pLXk" },
  { id: "autism", name: "Autism Spectrum Disorder", shortDescription: `Differences in social communication and repetitive patterns. ${careSentence}`, symptoms: ["Social communication differences", "Sensory sensitivities", "Routine dependence", "Restricted interests"], videoId: "RbwRrVw-CRo" },
  { id: "eating-anorexia", name: "Anorexia Nervosa", shortDescription: `Restrictive eating with fear of weight gain. ${careSentence}`, symptoms: ["Calorie restriction", "Low body weight", "Body image distortion", "Amenorrhea/weakness"], videoId: "M1CHPnZfFmU" },
  { id: "eating-bulimia", name: "Bulimia Nervosa", shortDescription: `Binge eating with compensatory behaviors. ${careSentence}`, symptoms: ["Binge episodes", "Purging", "Shame/guilt", "Weight fluctuations"], videoId: "M1CHPnZfFmU" },
  { id: "eating-bed", name: "Binge-Eating Disorder", shortDescription: `Recurrent binge episodes without purging. ${careSentence}`, symptoms: ["Loss of control eating", "Eating rapidly", "Distress after binges", "Secretive eating"], videoId: "M1CHPnZfFmU" },
  { id: "insomnia", name: "Insomnia Disorder", shortDescription: `Difficulty sleeping with daytime impairment. ${careSentence}`, symptoms: ["Difficulty falling asleep", "Frequent awakenings", "Early waking", "Daytime fatigue"], videoId: "5MuIMqhT8DM" },
  { id: "narcolepsy", name: "Narcolepsy", shortDescription: `Daytime sleep attacks and REM dysregulation. ${careSentence}`, symptoms: ["Sudden sleep episodes", "Cataplexy", "Sleep paralysis", "Hallucinations at sleep onset"], videoId: "S8vAadQv1zY" },
  { id: "substance", name: "Substance Use Disorders", shortDescription: `Compulsive use despite harm. ${careSentence}`, symptoms: ["Craving", "Tolerance", "Withdrawal", "Neglecting responsibilities"], videoId: "6q1RH8A3O3c" },
  { id: "alcohol", name: "Alcohol Use Disorder", shortDescription: `Problematic alcohol use impacting health and life. ${careSentence}`, symptoms: ["Loss of control drinking", "Withdrawal", "Continued use despite harm", "Blackouts"], videoId: "6q1RH8A3O3c" },
  { id: "gambling", name: "Gambling Disorder", shortDescription: `Persistent problematic gambling behavior. ${careSentence}`, symptoms: ["Preoccupation with gambling", "Chasing losses", "Lying about use", "Financial strain"], videoId: "v6Zl7fVckn8" },
  { id: "bpd", name: "Borderline Personality Disorder", shortDescription: `Instability in mood, self-image, and relationships. ${careSentence}`, symptoms: ["Fear of abandonment", "Impulsivity", "Emotional swings", "Chronic emptiness"], videoId: "to5qRLRSS7g" },
  { id: "antisocial", name: "Antisocial Personality Disorder", shortDescription: `Pattern of violating rights and social norms. ${careSentence}`, symptoms: ["Deceitfulness", "Impulsivity", "Aggression", "Lack of remorse"], videoId: "KjQ2-6fQfW8" },
  { id: "narcissistic", name: "Narcissistic Personality Disorder", shortDescription: `Grandiosity and high need for admiration. ${careSentence}`, symptoms: ["Entitlement", "Lack of empathy", "Need for praise", "Interpersonal difficulties"], videoId: "arJLy3hX1E8" },
  { id: "histrionic", name: "Histrionic Personality Disorder", shortDescription: `Excessive emotionality and attention-seeking. ${careSentence}`, symptoms: ["Attention-seeking", "Rapidly shifting emotions", "Suggestibility", "Shallow expression"], videoId: "2_uRwi4XSL0" },
  { id: "avoidant", name: "Avoidant Personality Disorder", shortDescription: `Social inhibition due to fear of criticism. ${careSentence}`, symptoms: ["Avoiding social contact", "Hypersensitivity to rejection", "Low confidence", "Isolation"], videoId: "YmM22eRjvCk" },
  { id: "dependent", name: "Dependent Personality Disorder", shortDescription: `Excessive need to be cared for. ${careSentence}`, symptoms: ["Difficulty making decisions", "Need reassurance", "Fear of separation", "Submissiveness"], videoId: "tN3f6xD3gg8" },
  { id: "ocpd", name: "Obsessive-Compulsive Personality Disorder", shortDescription: `Preoccupation with order, control, perfectionism. ${careSentence}`, symptoms: ["Perfectionism", "Rigidity", "Work over-commitment", "Difficulty delegating"], videoId: "DhlRgwdDc-E" },
  { id: "dissociative", name: "Dissociative Disorders", shortDescription: `Disruptions in memory, identity, or perception. ${careSentence}`, symptoms: ["Detachment", "Memory gaps", "Identity confusion", "Feeling unreal"], videoId: "1FXw3nX7nYg" },
  { id: "somatic", name: "Somatic Symptom Disorder", shortDescription: `Distressing physical symptoms with excessive concern. ${careSentence}`, symptoms: ["Frequent symptom focus", "Health anxiety", "Repeated care seeking", "Functional impairment"], videoId: "V0M2f4fM3CU" },
  { id: "illness-anxiety", name: "Illness Anxiety Disorder", shortDescription: `Strong fear of serious illness despite limited symptoms. ${careSentence}`, symptoms: ["Health preoccupation", "Repeated checking", "Reassurance seeking", "Avoiding healthcare"], videoId: "V0M2f4fM3CU" },
  { id: "conversion", name: "Conversion Disorder", shortDescription: `Neurological-like symptoms without matching neurological disease. ${careSentence}`, symptoms: ["Weakness/paralysis", "Abnormal movements", "Sensory symptoms", "Episodes"], videoId: "V0M2f4fM3CU" },
  { id: "factitious", name: "Factitious Disorder", shortDescription: `Intentional symptom production to assume sick role. ${careSentence}`, symptoms: ["Inconsistent history", "Frequent hospital use", "Tampering signs", "Deceptive behavior"], videoId: "V0M2f4fM3CU" },
  { id: "dmdd", name: "Disruptive Mood Dysregulation Disorder", shortDescription: `Severe irritability and temper outbursts in youth. ${careSentence}`, symptoms: ["Frequent tantrums", "Irritable mood", "Impairment at school/home", "Persistent pattern"], videoId: "KSvk8LLBo2g" },
  { id: "odd", name: "Oppositional Defiant Disorder", shortDescription: `Pattern of angry/defiant behavior toward authority. ${careSentence}`, symptoms: ["Argumentative behavior", "Angry mood", "Vindictiveness", "Rule resistance"], videoId: "Nfyz4sO30qQ" },
  { id: "conduct", name: "Conduct Disorder", shortDescription: `Serious pattern of violating rules/rights of others. ${careSentence}`, symptoms: ["Aggression", "Property destruction", "Deceit/theft", "Serious rule violations"], videoId: "Nfyz4sO30qQ" },
  { id: "intermittent-explosive", name: "Intermittent Explosive Disorder", shortDescription: `Recurrent impulsive aggressive outbursts. ${careSentence}`, symptoms: ["Verbal/physical aggression", "Outbursts disproportionate", "Remorse after episodes", "Functional damage"], videoId: "jM4v5f4R8D8" },
  { id: "trichotillomania", name: "Trichotillomania", shortDescription: `Recurrent hair pulling causing loss/distress. ${careSentence}`, symptoms: ["Hair pulling urges", "Hair loss patches", "Tension before pulling", "Relief after pulling"], videoId: "DhlRgwdDc-E" },
  { id: "excoriation", name: "Excoriation (Skin-Picking) Disorder", shortDescription: `Repetitive skin picking causing lesions. ${careSentence}`, symptoms: ["Recurrent picking", "Skin damage", "Attempts to stop fail", "Distress/shame"], videoId: "DhlRgwdDc-E" },
  { id: "body-dysmorphic", name: "Body Dysmorphic Disorder", shortDescription: `Preoccupation with perceived appearance flaws. ${careSentence}`, symptoms: ["Mirror checking", "Camouflaging", "Reassurance seeking", "Social avoidance"], videoId: "eOl2xJ2f7n8" },
  { id: "gender-dysphoria", name: "Gender Dysphoria", shortDescription: `Distress due to mismatch between identity and assigned sex. ${careSentence}`, symptoms: ["Marked distress", "Body discomfort", "Social role distress", "Functional impairment"], videoId: "MitqjSYtwrQ" },
  { id: "paraphilic", name: "Paraphilic Disorders", shortDescription: `Atypical sexual interests causing distress or harm risk. ${careSentence}`, symptoms: ["Persistent atypical urges", "Distress", "Functional issues", "Risk behavior"], videoId: "c5W5b6qQg-k" },
  { id: "intellectual", name: "Intellectual Developmental Disorder", shortDescription: `Limits in intellectual and adaptive functioning. ${careSentence}`, symptoms: ["Learning difficulties", "Adaptive skill deficits", "Developmental delays", "Support needs"], videoId: "RbwRrVw-CRo" },
  { id: "communication", name: "Communication Disorders", shortDescription: `Problems in speech, language, or social communication. ${careSentence}`, symptoms: ["Delayed speech", "Language comprehension issues", "Fluency problems", "Pragmatic communication issues"], videoId: "RbwRrVw-CRo" },
  { id: "tic", name: "Tic Disorders (including Tourette)", shortDescription: `Sudden recurrent motor/vocal tics. ${careSentence}`, symptoms: ["Motor tics", "Vocal tics", "Urge before tic", "Waxing-waning pattern"], videoId: "jM4v5f4R8D8" },
];

export const helpGuides: HelpGuide[] = [
  {
    heading: "Solutions for Anxiety",
    solutions: [
      "Try paced breathing: inhale 4 seconds, exhale 6 seconds for 5 minutes.",
      "Do 20-30 minutes of regular movement (walk, stretch, light cardio).",
      "Limit caffeine and late-night screen exposure.",
      "Use grounding (5-4-3-2-1 sensory method) when overthinking starts.",
      "Try soothing routines like warm shower or non-caffeinated herbal tea.",
    ],
    resource: {
      title: "CCI Anxiety Modules (CBT-based worksheets and guides)",
      url: "https://www.cci.health.wa.gov.au/Resources/Looking-After-Yourself/Anxiety",
      source: "Centre for Clinical Interventions (Government health service)",
    },
  },
  {
    heading: "Solutions for Panic Attacks",
    solutions: [
      "Use diaphragmatic breathing: slow inhale through nose, longer exhale through mouth.",
      "Name it: 'This is panic, it will rise and pass.'",
      "Ground body posture: feet on floor, shoulders relaxed, loosen jaw.",
      "Avoid checking pulse repeatedly; focus outward on environment cues.",
      "Discuss recurring panic with a therapist trained in CBT/DBT.",
    ],
    resource: {
      title: "CCI Panic Resources (CBT-based panic management tools)",
      url: "https://www.cci.health.wa.gov.au/Resources/Looking-After-Yourself/Panic",
      source: "Centre for Clinical Interventions (Government health service)",
    },
  },
  {
    heading: "Solutions for Depression",
    solutions: [
      "Behavioral activation: one meaningful task daily.",
      "Keep sleep/wake timings fixed as much as possible.",
      "Spend some time in daylight and gentle movement each day.",
      "Reach out to one trusted person daily even for a short message.",
      "Seek professional support if symptoms persist beyond two weeks.",
    ],
    resource: {
      title: "CCI Depression Resources (CBT-based self-help modules)",
      url: "https://www.cci.health.wa.gov.au/Resources/Looking-After-Yourself/Depression",
      source: "Centre for Clinical Interventions (Government health service)",
    },
  },
  {
    heading: "Solutions for Insomnia",
    solutions: [
      "Set consistent bed and wake times every day.",
      "Keep phone/screens away in the final 60 minutes before sleep.",
      "Use low light and calming routines before bed.",
      "Avoid long daytime naps and reduce evening caffeine.",
      "Use CBT-I routines and sleep diary tracking.",
    ],
    resource: {
      title: "Path to Better Sleep (CBT-I resources and downloadable tools)",
      url: "https://www.veterantraining.va.gov/insomnia/resources.asp",
      source: "U.S. Department of Veterans Affairs",
    },
  },
];
