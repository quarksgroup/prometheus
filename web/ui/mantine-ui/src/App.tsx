import "@mantine/core/styles.css";
import "@mantine/code-highlight/styles.css";
import "@mantine/notifications/styles.css";
import "@mantine/dates/styles.css";
import "./mantine-overrides.css";
import classes from "./App.module.css";
import PrometheusLogo from "./images/prometheus-logo.svg";

import {
  ActionIcon,
  AppShell,
  Box,
  Burger,
  Button,
  Group,
  MantineProvider,
  Skeleton,
  Text,
  createTheme,
  rem,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import {
  IconBook,
  IconDeviceDesktopAnalytics,
  IconSearch,
} from "@tabler/icons-react";
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import QueryPage from "./pages/query/QueryPage";
import AlertsPage from "./pages/AlertsPage";
import AgentPage from "./pages/AgentPage";
import { Suspense } from "react";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeSelector } from "./components/ThemeSelector";
import { Notifications } from "@mantine/notifications";
import { useSettings } from "./state/settingsSlice";
import ReadinessWrapper from "./components/ReadinessWrapper";
import NotificationsProvider from "./components/NotificationsProvider";
import { QueryParamProvider } from "use-query-params";
import { ReactRouter6Adapter } from "use-query-params/adapters/react-router-6";
import { actionIconStyle, navIconStyle } from "./styles";

const queryClient = new QueryClient();

const mainNavPages = [
  {
    title: "Query",
    path: "/query",
    icon: <IconSearch style={navIconStyle} />,
    element: <QueryPage />,
    inAgentMode: false,
  },
];

const theme = createTheme({
  colors: {
    "codebox-bg": [
      "#f5f5f5",
      "#e7e7e7",
      "#cdcdcd",
      "#b2b2b2",
      "#9a9a9a",
      "#8b8b8b",
      "#848484",
      "#717171",
      "#656565",
      "#575757",
    ],
  },
});

const navLinkXPadding = "md";

function App() {
  const [opened, { toggle }] = useDisclosure();

  const { agentMode, consolesLink, pathPrefix } = useSettings();

  const navLinks = (
    <>
      {consolesLink && (
        <Button
          component="a"
          href={consolesLink}
          className={classes.link}
          leftSection={<IconDeviceDesktopAnalytics style={navIconStyle} />}
          px={navLinkXPadding}
        >
          Consoles
        </Button>
      )}

      {mainNavPages
        .filter((p) => !agentMode || p.inAgentMode)
        .map((p) => (
          <Button
            key={p.path}
            component="a"
            href={p.path}
            className={classes.link}
            leftSection={p.icon}
            px={navLinkXPadding}
          >
            {p.title}
          </Button>
        ))}
    </>
  );

  const navActionIcons = (
    <>
      <ThemeSelector />
      <ActionIcon
        component="a"
        href="https://prometheus.io/docs/prometheus/latest/getting_started/"
        target="_blank"
        color="gray"
        title="Documentation"
        aria-label="Documentation"
        size={rem(32)}
      >
        <IconBook style={actionIconStyle} />
      </ActionIcon>
    </>
  );

  return (
    <BrowserRouter basename={pathPrefix}>
      <QueryParamProvider adapter={ReactRouter6Adapter}>
        <MantineProvider defaultColorScheme="auto" theme={theme}>
          <Notifications position="top-right" />

          <QueryClientProvider client={queryClient}>
            <AppShell
              header={{ height: 56 }}
              navbar={{
                width: 300,
                // TODO: On pages with a long title like "/status", the navbar
                // breaks in an ugly way for narrow windows. Fix this.
                breakpoint: "sm",
                collapsed: { desktop: true, mobile: !opened },
              }}
              padding="md"
            >
              <NotificationsProvider>
                <AppShell.Header bg="rgb(65, 73, 81)" c="#fff">
                  <Group h="100%" px="md" wrap="nowrap">
                    <Group
                      style={{ flex: 1 }}
                      justify="space-between"
                      wrap="nowrap"
                    >
                      <Group gap={40} wrap="nowrap">
                        <a
                          href="/"
                          style={{ textDecoration: "none", color: "white" }}
                        >
                          <Group gap={10} wrap="nowrap">
                            <img src={PrometheusLogo} height={30} />
                            <Text hiddenFrom="sm" fz={20}>
                              Prometheus
                            </Text>
                            <Text visibleFrom="md" fz={20}>
                              Prometheus
                            </Text>
                            <Text fz={20}>{agentMode && "Agent"}</Text>
                          </Group>
                        </a>
                        <Group gap={12} visibleFrom="sm" wrap="nowrap">
                          {navLinks}
                        </Group>
                      </Group>
                      <Group visibleFrom="xs" wrap="nowrap" gap="xs">
                        {navActionIcons}
                      </Group>
                    </Group>
                    <Burger
                      opened={opened}
                      onClick={toggle}
                      hiddenFrom="sm"
                      size="sm"
                      color="gray.2"
                    />
                  </Group>
                </AppShell.Header>

                <AppShell.Navbar py="md" px={4} bg="rgb(65, 73, 81)" c="#fff">
                  {navLinks}
                  <Group mt="md" hiddenFrom="xs" justify="center">
                    {navActionIcons}
                  </Group>
                </AppShell.Navbar>
              </NotificationsProvider>

              <AppShell.Main>
                <ErrorBoundary key={location.pathname}>
                  <Suspense
                    fallback={
                      <Box mt="lg">
                        {Array.from(Array(10), (_, i) => (
                          <Skeleton
                            key={i}
                            height={40}
                            mb={15}
                            width={1000}
                            mx="auto"
                          />
                        ))}
                      </Box>
                    }
                  >
                    <Routes>
                      <Route
                        path="/"
                        element={
                          <Navigate
                            to={agentMode ? "/agent" : "/query"}
                            replace
                          />
                        }
                      />
                      {agentMode ? (
                        <Route
                          path="/agent"
                          element={
                            <ReadinessWrapper>
                              <AgentPage />
                            </ReadinessWrapper>
                          }
                        />
                      ) : (
                        <>
                          <Route
                            path="/query"
                            element={
                              <ReadinessWrapper>
                                <QueryPage />
                              </ReadinessWrapper>
                            }
                          />
                          <Route
                            path="/alerts"
                            element={
                              <ReadinessWrapper>
                                <AlertsPage />
                              </ReadinessWrapper>
                            }
                          />
                        </>
                      )}
                    </Routes>
                  </Suspense>
                </ErrorBoundary>
              </AppShell.Main>
            </AppShell>
            {/* <ReactQueryDevtools initialIsOpen={false} /> */}
          </QueryClientProvider>
        </MantineProvider>
      </QueryParamProvider>
    </BrowserRouter>
  );
}

export default App;
