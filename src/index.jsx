import ForgeUI, { render, Fragment, Text, Button, ButtonSet, useState, useProductContext } from "@forge/ui";
import api from "@forge/api";

const { LING_API_KEY, DEBUG_LOGGING } = process.env;

const OPTIONS = [
  ['Linguistic Parser', 'ling'],
];

const Panel = () => {
  const { platformContext: { issueKey } } = useProductContext();
  const [ling, setLing] = useState(null);

  async function setLingParser(countryCode) {
    const issueResponse = await api.asApp().requestJira(`/rest/api/2/issue/${issueKey}?fields=summary,description`);
    await checkResponse('Jira API', issueResponse);
    const { summary, description } = (await issueResponse.json()).fields;
    const response = await api.fetch(`https://api.meaningcloud.com/parser-2.0?key=57ca592c1af82ad89eed40c8aa5eec4f&of=json&lang=en&uw=y&tt=e&txt=${description}`);
    const json = await response.text();
    setLing({
      summary: summary,
      description: json
    });
  }
  
  // Render the UI
  return (
    <Fragment>
      <ButtonSet>
        {OPTIONS.map(([label, code]) =>
          <Button
            text={label}
            onClick={async () => { await setLingParser(code); }}
          />
        )}
      </ButtonSet>
      {ling && (
        <Fragment>
          <Text content={`**SUMMARY**`} />
          <Text content={ling.description} />
        </Fragment>
      )}
    </Fragment>
  );
};

async function checkResponse(apiName, response) {
  if (!response.ok) {
    const message = `Error from ${apiName}: ${response.status} ${await response.text()}`;
    console.error(message);
    throw new Error(message);
  } else if (DEBUG_LOGGING) {
    console.debug(`Response from ${apiName}: ${await response.text()}`);
  }
}

export const run = render(<Panel />);
