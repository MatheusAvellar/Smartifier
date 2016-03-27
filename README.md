# Smartifier Alpha
***(not functional yet)***

Turn any 140-character-long dumb sentence into a smart one, with a click!

(Live demo soon)
<hr>
This is a preview of the app in use:

![Image 1](http://i.imgur.com/e1x6z6Z.png)

![Image 2](http://i.imgur.com/oorMrCU.png)

Currently, it requests externally for synonyms, and allows you to cycle through them in order to pick the most suitable one for a chosen word.

## Known issues

- Having 2 instances of the same word on a sentence will cause the algorithm to replace both instances when the user picks a synonym;

- Conjugated verbs as well as nouns in the plural form will most times fail to acquire synonyms;

- Lack of efficiency: The program will request a word's synonyms even if it already had those in its temporary database;

- Synonyms are mixed into the same list, despite their type (*nouns*, *verbs*, *adjectives* etc);

- Issues with phrasal verbs, because synonyms list only returns the words, not the expressions, so we have incompatibilities;

- Having 2 instances of the same word on the synonyms list causes both of them to be on the 'selected' state;

![Image 3](http://i.imgur.com/Tg95I1o.png)