export default {
  id: 2,
  title: 'Battle Matrix',
  content: `
    <p><em>Hivecity Conquest</em> campaigns let players outmaneuver each other across a series of battles, where decisions made before each game shape how it unfolds. These campaigns blend strategy and bluffing but remain easy to run. They can accommodate any number of players.</p>
    <p>When setting up a battle matrix campaign, decide how long it will run. If each player can manage one game per week, a six to eight week campaign is ideal—though you can make it shorter or longer to suit your group. It's often best to start with a shorter campaign, and if everyone's enjoying it, you can jump straight into a new one afterward.</p>
    <p>Campaigns are played over a series of rounds. In each round, players pair up and fight a single battle. Before the game begins, each player secretly selects one of the following strategic options: <strong>Reinforce</strong>, <strong>Advance</strong>, or <strong>Subterfuge</strong>, and reveal this choice after setting up the battlefield. These choices not only determine which tactical advantage a player gains, the player who's choice beats the other players will be the attacker during the battle (if the mission calls for one). If both players choose the same option, they must roll off to determine the attacker.</p>
    <p>Each battle can have a mission and deployment randomly generated using the War Table interface, but you're free to create your own tailored to a specific playstyle or using missions from other supplements.</p>
    <p>At the end of each round, players earn campaign points based on their game results: <strong>3</strong> points for a win, <strong>1</strong> point for a draw, and <strong>0</strong> for a loss. The player with the highest total at the end of the campaign is declared the victor.</p>

    <div class="image-container">
      <img src="/images/attack-matrix.png" alt="Attack Matrix diagram showing strategic options" class="diagram" />
    </div>

    <ul class="options-list">
      <li class="options-list__item">
        Reinforce
        <ul class="options-inner-list">
          <li class="options-inner-list__item">
            <em>Preparing for the enemy's strike.</em>
          </li>
          <li class="options-inner-list__item">
            <strong>Beats: Advance</strong>
          </li>
          <li class="options-inner-list__item">
            Bonus: Choose one unit. That unit gains Cover until the end of the battle round. Additionally, while that unit remains stationary, it gets +1 to its Save characteristic (to a maximum of 3+) for the duration of the first battle round.
          </li>
        </ul>
      </li>
      <li class="options-list__item">
        Advance
        <ul class="options-inner-list">
          <li class="options-inner-list__item">
            <em>Surging towards enemy lines for a rapid strike.</em>
          </li>
          <li class="options-inner-list__item">
            <strong>Beats: Subterfuge</strong>
          </li>
          <li class="options-inner-list__item">
            Bonus: Choose one unit; it gains the ability Scout 6" at the for this battle.
          </li>
        </ul>
      </li>
      <li class="options-list__item">
        Subterfuge
        <ul class="options-inner-list">
          <li class="options-inner-list__item">
            <em>Slipping through shadows and preparing an ambush.</em>
          </li>
          <li class="options-inner-list__item">
            <strong>Beats: Reinforce</strong>
          </li>
          <li class="options-inner-list__item">
            Bonus: Choose one unit. You may redeploy it within your deployment zone or place it into Strategic Reserves (respecting points limits).
          </li>
        </ul>
      </li>
    </ul>
  `,
  keywords: ['setup', 'mission', 'battle', 'matrix', 'campaign', 'reinforce', 'advance', 'subterfuge']
};
