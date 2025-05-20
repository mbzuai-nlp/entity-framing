# Entity Framing and Role Portrayal in the News

Tarek Mahmoud, Zhuohan Xie, Dimitar Dimitrov, Nikolaos Nikolaidis, Purificação Silvano, Roman Yangarber, Shivam Sharma, Elisa Sartori, Nicolas Stefanovitch, Giovanni Da San Martino, Jakub Piskorski, Preslav Nakov

[Paper on arXiv](https://arxiv.org/abs/2502.14718)


## Abstract

We introduce a novel multilingual hierarchical corpus annotated for entity framing and role portrayal in news articles. The dataset uses a unique taxonomy inspired by storytelling elements, comprising 22 fine-grained roles, or archetypes, nested within three main categories: protagonist, antagonist, and innocent. Each archetype is carefully defined, capturing nuanced portrayals of entities such as guardian, martyr, and underdog for protagonists; tyrant, deceiver, and bigot for antagonists; and victim, scapegoat, and exploited for innocents. The dataset includes 1,378 recent news articles in five languages (Bulgarian, English, Hindi, European Portuguese, and Russian) focusing on two critical domains of global significance: the Ukraine-Russia War and Climate Change. Over 5,800 entity mentions have been annotated with role labels. This dataset serves as a valuable resource for research into role portrayal and has broader implications for news analysis. We describe the characteristics of the dataset and the annotation process, and we report evaluation results on fine-tuned state-of-the-art multilingual transformers and hierarchical zero-shot learning using LLMs at the level of a document, a paragraph, and a sentence.

## Dataset

- **Languages**: Bulgarian, English, Hindi, European Portuguese, Russian
- **Domains**: Ukraine-Russia War, Climate Change
- **Annotations**: 5,800+ entity mentions labeled with roles
- **Novel Taxonomy**: 22 fine-grained roles under three main categories


## Model and Code

We provide pretrained models and scripts for inference.

- [Pretrained Model](./models/pretrained_model.pt)
- [Inference Script](./scripts/inference_example.py)

## Visualization

<h2>🎭 Entity Framing Taxonomy</h2>
<div id="taxonomy"></div>

<!-- D3 Library -->
<script src="https://d3js.org/d3.v7.min.js"></script>
<script src="assets/js/taxonomy.js"></script>
<link rel="stylesheet" href="assets/css/taxonomy.css">


![Taxonomy](./assets/images/taxonomy.png)
*Figure 1: Hierarchical taxonomy of entity roles.*

## Citation

If you use our work, please cite:

```bibtex
@misc{mahmoud2025entityframingroleportrayal,
      title={Entity Framing and Role Portrayal in the News}, 
      author={Tarek Mahmoud and Zhuohan Xie and Dimitar Dimitrov and Nikolaos Nikolaidis and Purificação Silvano and Roman Yangarber and Shivam Sharma and Elisa Sartori and Nicolas Stefanovitch and Giovanni Da San Martino and Jakub Piskorski and Preslav Nakov},
      year={2025},
      eprint={2502.14718},
      archivePrefix={arXiv},
      primaryClass={cs.CL},
      url={https://arxiv.org/abs/2502.14718}, 
}
