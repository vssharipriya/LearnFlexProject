
# LearnFlex 
### Making learning easier, smarter, and more personal.

## Description

LearnFlex is a browser-based adaptive learning platform designed for students studying in CBSE Classes 6–10.

The project brings together NCERT-based curriculum content, chapter-wise lessons, practice questions, adaptive learning activities, and student progress tracking in one place.

The idea behind LearnFlex is simple: every student learns differently. Instead of following the same learning path for everyone, the platform uses a rule-based adaptive learning engine to respond to student performance, identify possible learning gaps, and provide suitable practice activities.

LearnFlex also includes offline learning support, teacher insights, multilingual interface options, and tools to make learning more accessible.

The platform follows the CBSE 2026–27 curriculum framework and relevant NCERT textbook chapter catalogues.

## Features

###  1. CBSE Curriculum Coverage

- Covers Classes 6, 7, 8, 9 and 10.
- Subject-wise and chapter-wise organization.
- Mathematics, Science and Social Studies.
- Listed language choices including English, Hindi and Sanskrit.
- Arts Education, Physical Education and Well-being, and Vocational Education activity modules.
- Class 9 Individuals in Society modules.
- Curriculum organization based on relevant NCERT editions and applicable CBSE provisions.

###  2. Adaptive Learning Engine

- Rule-based adaptive learning without generative AI.
- Identifies possible learning gaps through answer-choice patterns.
- Uses learner confidence signals alongside answer accuracy.
- Provides follow-up verification questions.
- Includes Smart Recovery missions to support students who need additional practice.
- Adjusts subsequent learning activities based on student performance.

###  3. Interactive Practice and Assessments

- 20 original practice questions for each chapter or activity module.
- Four question difficulty levels:
  - Foundation
  - Reinforcement
  - Standard
  - Challenge
- Five questions per difficulty level.
- Progressive hints and explanations.
- Misconception-based feedback.
- Follow-up checks to reinforce understanding.

**Note:** Practice questions are original learning materials and are not official CBSE or NCERT examination questions.

###  4. Student Learning Experience

- Student dashboard.
- Subject and chapter exploration.
- Interactive learning activities.
- Mastery and completion tracking.
- Learning activity history.
- Adaptive next-step recommendations.
- Recovery checkpoints.

###  5. Teacher Insights

- Class-scoped student roster.
- Chapter-level learning-gap information.
- Misconception patterns.
- Follow-up assessment outcomes.
- Student learning progress summaries.
- Evidence-quality summaries.
- CSV export for supported assessment records.

###  6. Offline Learning Support

- Service worker-based application caching.
- Offline access to saved learning materials.
- Downloadable subject and chapter packs.
- Local-first progress storage.
- Automatic synchronization when connectivity returns.
- Support for low-connectivity learning environments.

###  7. Data and Privacy Safeguards

- Authenticated and class/school-scoped server access.
- Consent register.
- Student deletion workflow.
- Limited evidence references.
- Backup and retention documentation.
- Server-side validation and scoped data access.

These safeguards are part of a pilot implementation and should not be considered an independent security audit or legal compliance certification.

###  8. Multilingual and Accessibility Support

- English, Telugu and Hindi interface language selection.
- Translated learning items where available.
- Speech support.
- Improved contrast options.
- Larger text settings.
- Reading-friendly mode.

Not every curriculum item has a fully reviewed translation. Translated drafts require review by a native subject educator.

###  9. Learning Evidence and Progress

- Student mastery tracking.
- Baseline and post-assessment records.
- Follow-up outcomes.
- Real-attempt summaries.
- CSV evidence export.
- Synthetic demo records excluded from pilot evidence.

###  10. Demo and Walkthrough

The project includes demo accounts and a step-by-step walkthrough for exploring student and teacher experiences.

Refer to:

`docs/DEMO-WALKTHROUGH.md`

## Technology Stack

| Technology | Purpose |
|---|---|
| HTML5 | Application structure |
| CSS3 | Styling and responsive interface |
| JavaScript | Application functionality |
| Node.js | Backend runtime |
| JSON | Curriculum and application data |
| Service Workers | Offline functionality |
| IndexedDB | Local learning data storage |
| Docker | Containerization |
| Render | Cloud deployment |

## Project Structure

```text
LearnFlex/
│
├── assets/                  # Images and static resources
├── backups/                 # Backup directory
├── data/                    # Application data
├── docs/                    # Documentation
├── tests/                   # Automated tests
│
├── adaptive-engine.js       # Adaptive learning logic
├── app-enhancement.js       # Application enhancements
├── app.js                   # Main application logic
├── curriculum.js            # Curriculum management
├── ncert-curriculum.js      # NCERT curriculum data
├── offline-manager.js       # Offline learning management
├── quality-upgrades.js      # Application improvements
│
├── index.html               # Main application page
├── styles.css               # Application styling
├── manifest.webmanifest     # Web app manifest
├── sw.js                    # Service worker
│
├── server.js                # Backend server
├── package.json             # Project dependencies and scripts
├── Dockerfile               # Docker configuration
├── render.yaml              # Render deployment configuration
├── .gitignore               # Git ignore rules
├── .dockerignore            # Docker ignore rules
└── README.md                # Project documentation
```

## Installation

Follow these steps to run LearnFlex locally.

### Prerequisites

Make sure you have the following installed:

- Node.js version 22.5.0 or later.
- npm.
- Git.

### 1. Clone the Repository

```bash
git clone YOUR_REPOSITORY_URL
```

### 2. Navigate to the Project Directory

```bash
cd LearnFlex
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Start the Application

```bash
npm start
```

### 5. Open in Your Browser

Once the server starts, visit:

http://localhost:3100

**Windows:** You can also double-click `start-learnflex.bat`.

**macOS/Linux:** Run the following command:

```bash
./start-learnflex.sh
```

## Usage

1. Start the LearnFlex application.
2. Open the application in your browser.
3. Explore the available CBSE classes and subjects.
4. Select a subject and chapter.
5. Read the lesson overview and examples.
6. Attempt the practice questions.
7. Explore adaptive follow-up questions and learning feedback.
8. Track learning progress through the available dashboard features.

Teachers can explore class-level insights and assessment information using the available teacher features.

## Testing

LearnFlex includes automated checks and test scripts.

Run these commands from the project directory:

| Command | Description |
|---|---|
| `npm run check` | Checks JavaScript syntax |
| `npm test` | Runs basic smoke tests |
| `npm run test:offline` | Tests offline functionality |
| `npm run test:browser` | Runs browser smoke tests |
| `npm run test:all` | Runs the complete test sequence |

For browser testing, a compatible Chromium environment is required.

## Offline Learning Guide

To use LearnFlex without an internet connection:

1. Start the application using `npm start` or open its deployed HTTPS version.
2. Open the application once while connected to the internet.
3. Sign in using the learner account on the device.
4. Open the Learn section.
5. Use Offline Learning Downloads to save a subject or all available subjects.
6. Alternatively, download an individual chapter from its lesson.
7. Disconnect from the internet and continue learning.
8. Reconnect to allow pending progress to synchronize with the authenticated backend.

Offline packs and learning progress are stored in browser storage. Browser storage can be cleared or evicted, so reconnect regularly and maintain normal backups.

For additional information, refer to:

`docs/ROUND-2-COVERAGE.md`

## Deployment

LearnFlex includes a `Dockerfile` and `render.yaml` to support deployment.

The project can be deployed through Render by connecting the GitHub repository and configuring the appropriate runtime or Docker deployment settings.

Before deploying:

- Verify the build and start commands.
- Configure required environment variables.
- Check database configuration and persistent storage requirements.
- Ensure that authentication and application routes work correctly.
- Test student and teacher experiences after deployment.
- Verify offline functionality on the deployed HTTPS website.

The application uses the following local start command:

```bash
npm start
```

## Official Curriculum References

The curriculum organization refers to the following official resources:

- CBSE Curriculum 2026–27: https://cbseacademic.nic.in/curriculum_2027.html
- CBSE Skill Education / Scheme of Studies: https://cbseacademic.nic.in/skill-education.html
- NCERT Textbook Catalogue: https://ncert.nic.in/textbook.php

**Curriculum note:** Subject, language and optional course combinations may vary by school and academic cohort. Teachers should verify the prescribed textbook editions and subject combinations before classroom use.

## Important Project Notes

- The platform focuses exclusively on CBSE/NCERT curriculum coverage for Classes 6–10.
- No state-board syllabus or state-board chapter content is included.
- Practice questions are original learning materials.
- Generative AI is intentionally excluded. The adaptive learning system uses deterministic, rule-based logic and curated curriculum-linked content.
- Lesson explanations and original questions are practice drafts that require subject-teacher review.
- Child-data safeguards are pilot features, not a certification of legal compliance or independent security auditing.

## Contributing

Suggestions, improvements and contributions are welcome.

If you would like to contribute:

1. Fork the repository.
2. Create a new branch for your changes.
3. Make the required modifications.
4. Run the available tests.
5. Submit a pull request.

## Future Improvements

- Expanded curriculum resources.
- More interactive learning activities.
- Improved adaptive learning recommendations.
- Enhanced student progress analytics.
- Further accessibility improvements.
- Additional assessment and reporting features.

## License

No open-source license has been specified yet. All rights remain with the project owner unless a license is added to this repository.

## Contact

For questions, suggestions or feedback, please open an issue in this GitHub repository.

---

**LearnFlex — Your learning journey, your pace.**
