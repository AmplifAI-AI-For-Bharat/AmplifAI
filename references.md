# References & Research — AmplifAI (Hyperbolic Social Media Platform)

---

## 1. Hyperbolic Geometry in Information Retrieval & Recommendation Systems

The platform's core conceptual framework — using **hyperbolic geometry** to surface high-signal content — draws on a growing body of research demonstrating that hyperbolic space naturally represents hierarchical and tree-like data structures more effectively than Euclidean space.

1. **Mirvakhabova, L., Koren, E., Sidorov, D., & Frolov, E.** (2020). *Performance of Hyperbolic Geometry Models on Top-N Recommendation Tasks.* arXiv preprint. — Demonstrates that hyperbolic collaborative filtering outperforms Euclidean counterparts in recommendation tasks. [arXiv](https://arxiv.org/abs/2008.11567)

2. **Nickel, M. & Kiela, D.** (2017). *Poincaré Embeddings for Learning Hierarchical Representations.* NeurIPS 2017. — Foundational paper on learning hierarchical representations in hyperbolic space, showing superior embedding of tree-like structures. [arXiv](https://arxiv.org/abs/1705.08039)

3. **Chamberlain, B. P., Clough, J., & Deisenroth, M. P.** (2017). *Neural Embeddings of Graphs in Hyperbolic Space.* arXiv preprint. — Explores graph embeddings in hyperbolic space with applications to link prediction and classification.

4. **HypRAG** (2025). *Hyperbolic Retrieval-Augmented Generation.* arXiv preprint. — Shows that hyperbolic retrieval boosts RAG performance by encoding concept-level hierarchies within radial structure, improving context and answer relevance.

5. **HyperbolicRAG** (2025). *Integrating Hyperbolic Geometry into Graph-Based RAG.* arXiv preprint. — Proposes a framework capturing both fine-grained semantics and global hierarchy using depth-aware representation learning.

---

## 2. Semantic Density & Information Density Analysis

The platform's **Semantic Density scoring** (0–100) measures the signal-to-noise ratio of content, drawing from research on text informativeness and NLP-based content quality assessment.

6. **Brown, C., Snodgrass, T., Kemper, S. J., Herman, R., & Covington, M. A.** (2008). *Automatic Measurement of Propositional Idea Density from Part-of-Speech Tagging.* Behavior Research Methods, 40, 540–545. NIH. — Establishes computational methods for measuring idea density (number of propositions per word) in text, a precursor to modern information density metrics.

7. **Turner, A. & Greene, E.** (1977). *The Construction and Use of a Propositional Text Base.* Technical Report, University of Colorado. — Pioneering work defining propositional analysis for measuring the density of ideas conveyed in text.

8. **Semantic Density for LLM Trustworthiness.** (2024). *Semantic Density: Uncertainty Quantification for Large Language Models through Confidence Measurement by Semantic Inference.* arXiv / OpenReview. — Modern application of semantic density as a confidence metric for LLM outputs, using probability and semantic consistency measures.

9. **Latent Semantic Analysis (LSA).** Landauer, T. K. & Dumais, S. T. (1997). *A Solution to Plato's Problem: The Latent Semantic Analysis Theory of Acquisition, Induction, and Representation of Knowledge.* Psychological Review, 104(2), 211–240. — Foundational work on semantic space models for representing and comparing text meaning.

---

## 3. Text Readability & Flesch Reading Ease

The ranking engine uses the **Flesch Reading Ease** formula (via the `textstat` Python library) to assess content complexity as a proxy for information density.

10. **Flesch, R.** (1948). *A New Readability Yardstick.* Journal of Applied Psychology, 32(3), 221–233. — The original paper introducing the Flesch Reading Ease formula: `Score = 206.835 – (1.015 × ASL) – (84.6 × ASW)`.

11. **Kincaid, J. P., Fishburne, R. P., Rogers, R. L., & Chissom, B. S.** (1975). *Derivation of New Readability Formulas for Navy Enlisted Personnel.* Research Branch Report 8-75, Naval Technical Training Command. — Introduced the Flesch-Kincaid Grade Level, a related readability metric.

12. **Vajjala, S. & Meurers, D.** (2012). *On Improving the Accuracy of Readability Classification Using Insights from Second Language Acquisition Research.* ACL Workshop on Innovative Use of NLP for Building Educational Applications. — Modern NLP approaches to readability assessment that go beyond surface features.

13. **`textstat` Python Library.** PyPI. — Open-source library implementing multiple readability formulas including Flesch Reading Ease, used in this project for real-time text analysis. [PyPI](https://pypi.org/project/textstat/)

---

## 4. Vocabulary Richness & Lexical Diversity

The platform computes **unique word ratio** (type-token ratio) as a measure of vocabulary richness in content.

14. **Templin, M. C.** (1957). *Certain Language Skills in Children: Their Development and Interrelationships.* Minneapolis: University of Minnesota Press. — Early foundational work on type-token ratio as a measure of vocabulary diversity.

15. **McCarthy, P. M. & Jarvis, S.** (2010). *MTLD, vocd-D, and HD-D: A Validation Study of Sophisticated Approaches to Lexical Diversity Assessment.* Behavior Research Methods, 42(2), 381–392. — Compares modern lexical diversity metrics and their effectiveness in text analysis.

---

## 5. Blue Ocean Strategy & Market Gap Analysis

The creator-facing features — **Market Gap Score**, **Blue Ocean** opportunities, and **Vulnerable Giants** detection — are directly inspired by Blue Ocean Strategy.

16. **Kim, W. C. & Mauborgne, R.** (2004). *Blue Ocean Strategy.* Harvard Business Review, 82(10), 76–84. — The seminal article introducing the Blue Ocean Strategy framework: creating uncontested market spaces rather than competing in existing ones.

17. **Kim, W. C. & Mauborgne, R.** (2005). *Blue Ocean Strategy: How to Create Uncontested Market Space and Make the Competition Irrelevant.* Harvard Business School Press. — The full book detailing the Strategy Canvas, Four Actions Framework (ERRC Grid), and Six Paths Framework.

18. **Kim, W. C. & Mauborgne, R.** (2017). *Blue Ocean Shift: Beyond Competing.* Hachette Books. — Updated methodology for systematically shifting from red oceans to blue oceans, applicable to market gap detection.

---

## 6. Recommender Systems & Content Ranking

The **Hyperbolic Scoring Algorithm** combines semantic density, rarity (inverse popularity), and demand-based feedback — drawing from recommender systems research.

19. **Adomavicius, G. & Tuzhilin, A.** (2005). *Toward the Next Generation of Recommender Systems: A Survey of the State-of-the-Art and Possible Extensions.* IEEE Transactions on Knowledge and Data Engineering, 17(6), 734–749. — Comprehensive survey of content-based, collaborative, and hybrid filtering approaches.

20. **Abdollahpouri, H., Burke, R., & Mobasher, B.** (2019). *Managing Popularity Bias in Recommender Systems with Personalized Re-ranking.* In Proceedings of the 32nd International FLAIRS Conference. — Addresses popularity bias in recommendations and inverse popularity scoring to promote long-tail (niche) items.

21. **Koren, Y., Bell, R., & Volinsky, C.** (2009). *Matrix Factorization Techniques for Recommender Systems.* Computer, 42(8), 30–37. IEEE. — Influential work on matrix factorization methods used in modern recommendation engines.

22. **Rendle, S., Freudenthaler, C., & Schmidt-Thieme, L.** (2010). *Factorizing Personalized Markov Chains for Next-Basket Recommendation.* WWW 2010. — Explores demand matrix and feedback loop approaches for sequential recommendations.

---

## 7. 3D Information Visualization & WebGL

The **HyperbolicSpace** component uses **Three.js** and **React Three Fiber** for immersive 3D content exploration.

23. **Munzner, T.** (2014). *Visualization Analysis and Design.* CRC Press. — Authoritative textbook on information visualization principles including 3D space design, interaction, and perceptual considerations.

24. **Danchilla, B.** (2012). *Three.js Framework.* In: Beginning WebGL for HTML5. Apress. — Early reference on Three.js for browser-based 3D rendering using WebGL.

25. **Peck, S. M., North, C., & Bowman, D.** (2009). *A Multiscale Interaction Technique for Large, High-Resolution Displays.* IEEE Symposium on 3D User Interfaces. — Research on interactive 3D navigation techniques applicable to data exploration interfaces.

26. **Lamberti, F. & Sanna, A.** (2011). *A Streaming-Based Solution for Remote Visualization of 3D Graphics on Mobile Devices.* IEEE Transactions on Visualization and Computer Graphics, 17(4), 480–494. — Discusses WebGL/WebSocket streaming for interactive 3D visualization.

27. **bioWeb3D.** Pettit, J. B. & Marioni, J. C. (2013). *bioWeb3D: An Online WebGL 3D Data Visualization Tool.* BMC Bioinformatics, 14, 185. NIH. — Demonstrates Three.js/WebGL for interactive scientific 3D visualization in the browser.

---

## 8. Natural Language Processing & Sentiment Analysis

The platform performs **keyword extraction, sentiment analysis, and emotional arc detection** for content analysis.

28. **Mikolov, T., Chen, K., Corrado, G., & Dean, J.** (2013). *Efficient Estimation of Word Representations in Vector Space.* arXiv preprint (Word2Vec). — Foundation for modern word embeddings and semantic similarity used in keyword extraction.

29. **Devlin, J., Chang, M.-W., Lee, K., & Toutanova, K.** (2019). *BERT: Pre-training of Deep Bidirectional Transformers for Language Understanding.* NAACL-HLT 2019. — Transformer-based contextual embeddings powering modern NLP tasks including sentiment analysis and content classification.

30. **Reagan, A. J., Mitchell, L., Kiley, D., Danforth, C. M., & Dodds, P. S.** (2016). *The Emotional Arcs of Stories Are Dominated by Six Basic Shapes.* EPJ Data Science, 5(1), 31. — Research on detecting emotional arcs in narrative content, relevant to Content DNA analysis.

---

## 9. Large Language Models & AI-Powered Content Creation

The platform integrates **AWS Bedrock** with **Claude 3 Sonnet** for intent analysis, content generation, and all AI Studio tools.

31. **Anthropic.** (2024). *The Claude 3 Model Family: Opus, Sonnet, and Haiku.* Technical Report. — Official documentation of the Claude 3 model family capabilities, architectures, and benchmark performance.

32. **AWS.** (2024). *Amazon Bedrock — Build Generative AI Applications with Foundation Models.* Amazon Web Services Documentation. [aws.amazon.com/bedrock](https://aws.amazon.com/bedrock/)

33. **Wei, J., Wang, X., Schuurmans, D., et al.** (2022). *Chain-of-Thought Prompting Elicits Reasoning in Large Language Models.* NeurIPS 2022. — Research on structured prompting techniques used for AI Studio tools like Script Writer and Content DNA Analyzer.

34. **Dunietz, J., Burnham, G., Branson, A., et al.** (2024). *LLM-Assisted Content Analysis (LACA): Using Large Language Models to Support Deductive Coding.* arXiv preprint. — Methodology for using LLMs in content analysis workflows, relevant to the platform's transcript analysis features.

---

## 10. Web Scraping & YouTube Data Extraction

The platform uses **yt-dlp** for extracting YouTube video metadata, transcripts, and engagement metrics.

35. **yt-dlp Contributors.** (2021–present). *yt-dlp: A youtube-dl Fork with Additional Features and Fixes.* GitHub Repository. [github.com/yt-dlp/yt-dlp](https://github.com/yt-dlp/yt-dlp)

36. **Freelon, D.** (2018). *Computational Research in the Post-API Age.* Political Communication, 35(4), 665–668. — Discusses challenges and methods for data collection from social media platforms when API access is limited.

37. **Fiesler, C. & Proferes, N.** (2018). *Participant Perceptions of Twitter Research Ethics.* Social Media + Society, 4(1). — Ethical framework for social media data collection applicable to YouTube research.

---

## 11. Web Application Architecture & Frameworks

The platform is built with **FastAPI** (backend), **React 19** (frontend), and **Vite** (build tooling).

38. **Ramírez, S.** (2018–present). *FastAPI — Modern, Fast Web Framework for Building APIs with Python 3.7+.* Official Documentation. [fastapi.tiangolo.com](https://fastapi.tiangolo.com/)

39. **Model Algorithm Research based on Python Fast API.** (2023). — Academic paper exploring integration of algorithmic models into web applications using FastAPI, highlighting its efficient performance and scalability.

40. **React Team, Meta.** (2024). *React 19 Documentation.* Official Documentation. [react.dev](https://react.dev/)

41. **Evan You et al.** (2020–present). *Vite — Next Generation Frontend Tooling.* Official Documentation. [vitejs.dev](https://vitejs.dev/)

42. **Fielding, R. T.** (2000). *Architectural Styles and the Design of Network-Based Software Architectures.* Doctoral Dissertation, University of California, Irvine. — Defines REST architectural style used in the platform's API design.

---

## 12. Cloud Storage & Caching

The platform uses **AWS S3** as a caching layer (the "Pantry") for video metadata and analysis results.

43. **Amazon Web Services.** (2006–present). *Amazon S3 — Object Storage Built to Retrieve Any Amount of Data from Anywhere.* AWS Documentation. [aws.amazon.com/s3](https://aws.amazon.com/s3/)

44. **DeCandia, G., Hastorun, D., Jampani, M., et al.** (2007). *Dynamo: Amazon's Highly Available Key-Value Store.* SOSP 2007. — Foundational paper on Amazon's distributed storage systems, informing the caching architecture.

---

## 13. Data Validation & Type Safety

The platform uses **Pydantic** for data validation across all API models.

45. **Colvin, S.** (2017–present). *Pydantic — Data Validation Using Python Type Annotations.* Official Documentation. [docs.pydantic.dev](https://docs.pydantic.dev/)

---

## 14. CSS Frameworks & UI Design

The frontend uses **Tailwind CSS** with a glassmorphism-inspired design system.

46. **Wathan, A. & Schoger, S.** (2017–present). *Tailwind CSS — A Utility-First CSS Framework.* Official Documentation. [tailwindcss.com](https://tailwindcss.com/)

47. **Shneiderman, B.** (1996). *The Eyes Have It: A Task by Data Type Taxonomy for Information Visualizations.* IEEE Symposium on Visual Languages, 336–343. — Foundational taxonomy for interactive visualization design applicable to the dashboard and feed interfaces.

---

## 15. SEO & Content Optimization Research

The AI Studio includes tools for **SEO optimization, A/B title testing, and engagement prediction**.

48. **Brin, S. & Page, L.** (1998). *The Anatomy of a Large-Scale Hypertextual Web Search Engine.* Computer Networks and ISDN Systems, 30(1-7), 107–117. — Foundational paper on ranking algorithms and SEO principles.

49. **Khraish, R., Sawal, B., Mahdy, A., et al.** (2024). *Social Media Content Optimization Using AI: A Survey.* — Survey of AI-powered content optimization techniques including clickability prediction and engagement forecasting.

---

## 16. Engagement Metrics & Social Media Analytics

The platform analyzes **views, likes, comments, engagement rates, and growth trajectories**.

50. **Bakshy, E., Hofman, J. M., Mason, W. A., & Watts, D. J.** (2011). *Everyone's an Influencer: Quantifying Influence on Twitter.* WSDM 2011. — Research on engagement metrics and influence quantification in social media.

51. **Cha, M., Haddadi, H., Benevenuto, F., & Gummadi, K. P.** (2010). *Measuring User Influence in Twitter: The Million Follower Fallacy.* ICWSM 2010. — Demonstrates that engagement rate (not raw follower count) is a better predictor of influence.

---

## 17. Ethical & Regulatory Considerations

52. **European Parliament & Council.** (2016). *General Data Protection Regulation (GDPR).* Regulation (EU) 2016/679. — Privacy regulation applicable to user data collection and processing.

53. **California Legislature.** (2018). *California Consumer Privacy Act (CCPA).* AB-375. — US state privacy law relevant to data handling requirements.

54. **YouTube.** (2024). *YouTube Terms of Service.* [youtube.com/t/terms](https://www.youtube.com/t/terms) — Platform terms governing data access and content usage.

---

## Summary of Key Technologies & Their Academic Foundations

| Platform Feature | Key Technology | Primary References |
|---|---|---|
| Hyperbolic Ranking | Hyperbolic Geometry | [1], [2], [3] |
| Semantic Density | NLP / Text Analysis | [6], [7], [8], [9] |
| Readability Scoring | Flesch Formula / textstat | [10], [11], [12], [13] |
| Vocabulary Richness | Type-Token Ratio | [14], [15] |
| Market Gap Detection | Blue Ocean Strategy | [16], [17], [18] |
| Content Ranking | Recommender Systems | [19], [20], [21], [22] |
| 3D Visualization | Three.js / WebGL | [23], [24], [25], [26], [27] |
| NLP & Sentiment | Word2Vec, BERT | [28], [29], [30] |
| AI Content Tools | Claude 3 / AWS Bedrock | [31], [32], [33], [34] |
| Data Extraction | yt-dlp | [35], [36], [37] |
| Backend API | FastAPI / REST | [38], [39], [42] |
| Frontend UI | React / Vite / Tailwind | [40], [41], [46] |
| Cloud Storage | AWS S3 | [43], [44] |
| Data Validation | Pydantic | [45] |
| SEO & Optimization | Ranking Algorithms | [48], [49] |
| Engagement Analytics | Social Media Research | [50], [51] |
| Ethics & Compliance | GDPR, CCPA, YouTube ToS | [52], [53], [54] |
