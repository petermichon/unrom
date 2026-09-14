export async function listDevicesV1S(): Promise<string | Error> {
  const response = await fetch(
    "https://gitlab.e.foundation/e/os/releases/-/raw/v1-s/.gitlab-ci.yml",
  );
  if (!response.ok) {
    return new Error(
      `Failed to fetch /e/OS devices from v1-s: ${response.statusText}`,
    );
  }

  return await response.text();
}

export async function listDevicesV1T(): Promise<string | Error> {
  const response = await fetch(
    "https://gitlab.e.foundation/e/os/releases/-/raw/v1-t/.gitlab-ci.yml",
  );
  if (!response.ok) {
    return new Error(
      `Failed to fetch /e/OS devices from v1-t: ${response.statusText}`,
    );
  }

  return await response.text();
}

export async function listDevicesA14(): Promise<string | Error> {
  const response = await fetch(
    "https://gitlab.e.foundation/e/os/releases/-/raw/a14/.gitlab-ci.yml",
  );
  if (!response.ok) {
    return new Error(
      `Failed to fetch /e/OS devices from a14: ${response.statusText}`,
    );
  }

  return await response.text();
}

export async function listDevicesA15(): Promise<string | Error> {
  const response = await fetch(
    "https://gitlab.e.foundation/e/os/releases/-/raw/a15/.gitlab-ci.yml",
  );
  if (!response.ok) {
    return new Error(
      `Failed to fetch /e/OS devices from a15: ${response.statusText}`,
    );
  }

  return await response.text();
}

export async function listDevicesA16(): Promise<string | Error> {
  const response = await fetch(
    "https://gitlab.e.foundation/e/os/releases/-/raw/a16/.gitlab-ci.yml",
  );
  if (!response.ok) {
    return new Error(
      `Failed to fetch /e/OS devices from a16: ${response.statusText}`,
    );
  }

  return await response.text();
}
