package ui

import (
	"bufio"
	"context"
	"fmt"
	"os"
	"strings"
	"sync"
	"time"

	"github.com/charmbracelet/bubbles/spinner"
	"github.com/charmbracelet/bubbles/viewport"
	tea "github.com/charmbracelet/bubbletea"
	"github.com/charmbracelet/lipgloss"
	"github.com/fatih/color"
	"github.com/muesli/reflow/wordwrap"
	"github.com/muesli/termenv"
)

var (
	output     = termenv.NewOutput(os.Stdout)
	hasColor   = output.ColorProfile() != termenv.Ascii
	bold       = lipgloss.NewStyle().Bold(true)
	dim        = lipgloss.NewStyle().Faint(true)
	italic     = lipgloss.NewStyle().Italic(true)

	primary    = lipgloss.AdaptiveColor{Light: "#1a1a2e", Dark: "#eaeaea"}
	secondary  = lipgloss.AdaptiveColor{Light: "#16213e", Dark: "#b8b8b8"}
	accent     = lipgloss.AdaptiveColor{Light: "#0f3460", Dark: "#7aa2f7"}
	success    = lipgloss.AdaptiveColor{Light: "#27ae60", Dark: "#4ec9b0"}
	warning    = lipgloss.AdaptiveColor{Light: "#f39c12", Dark: "#dcdcaa"}
	errorColor = lipgloss.AdaptiveColor{Light: "#e74c3c", Dark: "#f44747"}
	muted      = lipgloss.AdaptiveColor{Light: "#7f8c8d", Dark: "#858585"}

	userStyle    = lipgloss.NewStyle().Foreground(primary).Bold(true)
	agentStyle   = lipgloss.NewStyle().Foreground(accent).Bold(true)
	systemStyle  = lipgloss.NewStyle().Foreground(muted).Italic(true)
	errorStyle   = lipgloss.NewStyle().Foreground(errorColor).Bold(true)
	toolStyle    = lipgloss.NewStyle().Foreground(warning)
	codeStyle    = lipgloss.NewStyle().Foreground(success).Background(lipgloss.Color("#1e1e2e")).Padding(0, 1)
	blockStyle   = lipgloss.NewStyle().Border(lipgloss.RoundedBorder()).BorderForeground(muted).Padding(1, 2)
)

type Terminal struct {
	scanner   *bufio.Scanner
	mu        sync.Mutex
	history   []string
	histIdx   int
	width     int
	height    int
	spinner   spinner.Model
	viewport  viewport.Model
	program   *tea.Program
}

func NewTerminal() *Terminal {
	s := spinner.New()
	s.Spinner = spinner.Dot
	s.Style = lipgloss.NewStyle().Foreground(accent)

	vp := viewport.New(80, 20)
	vp.Style = lipgloss.NewStyle().BorderForeground(muted)

	return &Terminal{
		scanner: bufio.NewScanner(os.Stdin),
		history: []string{},
		histIdx: -1,
		width:   80,
		height:  24,
		spinner: s,
		viewport: vp,
	}
}

func (t *Terminal) SetSize(w, h int) {
	t.width = w
	t.height = h
	t.viewport.Width = w - 4
	t.viewport.Height = h - 8
}

func (t *Terminal) ReadInput(prompt string) (string, error) {
	fmt.Print(prompt)
	if !t.scanner.Scan() {
		return "", fmt.Errorf("input error")
	}
	input := strings.TrimSpace(t.scanner.Text())
	if input != "" {
		t.history = append(t.history, input)
		t.histIdx = len(t.history)
	}
	return input, nil
}

func (t *Terminal) PrintUser(msg string) {
	t.mu.Lock()
	defer t.mu.Unlock()
	prefix := userStyle.Render("▸ You")
	fmt.Printf("%s %s\n", prefix, msg)
}

func (t *Terminal) PrintAgent(msg string) {
	t.mu.Lock()
	defer t.mu.Unlock()
	prefix := agentStyle.Render("▸ Teynex")
	rendered := t.renderMarkdown(msg)
	fmt.Printf("%s\n%s\n", prefix, rendered)
}

func (t *Terminal) PrintSystem(msg string) {
	t.mu.Lock()
	defer t.mu.Unlock()
	prefix := systemStyle.Render("◆ System")
	fmt.Printf("%s %s\n", prefix, dim.Render(msg))
}

func (t *Terminal) PrintError(msg string) {
	t.mu.Lock()
	defer t.mu.Unlock()
	prefix := errorStyle.Render("✗ Error")
	fmt.Printf("%s %s\n", prefix, msg)
}

func (t *Terminal) PrintTool(name, args, result string) {
	t.mu.Lock()
	defer t.mu.Unlock()
	
	toolName := toolStyle.Render(fmt.Sprintf("⚡ %s", name))
	toolArgs := dim.Render(args)
	
	var out strings.Builder
	out.WriteString(fmt.Sprintf("%s %s\n", toolName, toolArgs))
	
	if result != "" {
		lines := strings.Split(result, "\n")
		for _, line := range lines {
			if strings.TrimSpace(line) != "" {
				out.WriteString(fmt.Sprintf("  %s\n", line))
			}
		}
	}
	
	block := blockStyle.Render(out.String())
	fmt.Println(block)
}

func (t *Terminal) PrintCode(lang, code string) {
	t.mu.Lock()
	defer t.mu.Unlock()
	
	header := dim.Render(fmt.Sprintf("```%s", lang))
	fmt.Println(header)
	
	lines := strings.Split(code, "\n")
	for i, line := range lines {
		num := dim.Render(fmt.Sprintf("%3d │", i+1))
		fmt.Printf("%s %s\n", num, line)
	}
	fmt.Println(dim.Render("```"))
}

func (t *Terminal) PrintTable(headers []string, rows [][]string) {
	t.mu.Lock()
	defer t.mu.Unlock()
	
	if len(rows) == 0 {
		return
	}
	
	colWidths := make([]int, len(headers))
	for i, h := range headers {
		colWidths[i] = len(h)
	}
	for _, row := range rows {
		for i, cell := range row {
			if i < len(colWidths) && len(cell) > colWidths[i] {
				colWidths[i] = len(cell)
			}
		}
	}
	
	printRow := func(cells []string, isHeader bool) {
		var parts []string
		for i, cell := range cells {
			if i >= len(colWidths) {
				continue
			}
			pad := colWidths[i] - len(cell) + 2
			style := lipgloss.NewStyle().Width(colWidths[i] + 2)
			if isHeader {
				style = style.Bold(true).Foreground(accent)
			}
			parts = append(parts, style.Render(cell+strings.Repeat(" ", pad)))
		}
		fmt.Println(strings.Join(parts, " │ "))
	}
	
	printRow(headers, true)
	
	sep := make([]string, len(headers))
	for i, w := range colWidths {
		sep[i] = strings.Repeat("─", w+2)
	}
	fmt.Println(dim.Render(strings.Join(sep, "─┼─")))
	
	for _, row := range rows {
		printRow(row, false)
	}
}

func (t *Terminal) StartSpinner(msg string) {
	t.mu.Lock()
	defer t.mu.Unlock()
	t.spinner.Spinner = spinner.Dot
	t.spinner.Style = lipgloss.NewStyle().Foreground(accent)
	fmt.Printf("\r%s %s", t.spinner.View(), msg)
}

func (t *Terminal) StopSpinner(success bool, msg string) {
	t.mu.Lock()
	defer t.mu.Unlock()
	
	if success {
		fmt.Printf("\r%s %s\n", successColor("✓"), msg)
	} else {
		fmt.Printf("\r%s %s\n", errorColor("✗"), msg)
	}
}

func (t *Terminal) ShowHelp() {
	t.mu.Lock()
	defer t.mu.Unlock()
	
	help := blockStyle.Render(`Teynex CLI Agent — Kuchli va qulay AI yordamchi

BOSH BUYRUQLAR:
  @ls [path]           — katalog tarkibini ko'rsatish
  @cat <file>          — fayl o'qish
  @grep <pattern> <path> — matn qidirish
  @bash <cmd>          — shell buyrug'ini bajarish
  @cd <dir>            — ishchi katalogni o'zgartirish
  @edit <file>         — fayl tahrirlash
  @write <file>        — fayl yaratish
  @mkdir <path>        — katalog yaratish
  @rm <path>           — o'chirish

KENG FUNKSIYALAR:
  /help                — yordam ko'rsatish
  /config              — sozlamalar
  /history             — tarixni ko'rsatish
  /clear               — ekranni tozalash
  /theme               — mavzuni o'zgartirish
  exit / quit          — chiqish

CLAVIATURA QISQARTMALARI:
  ↑ / ↓                — tarixda harakatlanish
  Ctrl+R               — tarixda qidirish
  Tab                  — avtotugallash
  Ctrl+C               — joriy amalni bekor qilish
  Ctrl+L               — ekranni tozalash`)
	
	fmt.Println(help)
}

func (t *Terminal) renderMarkdown(text string) string {
	lines := strings.Split(text, "\n")
	var result []string
	inCode := false
	codeLang := ""
	var codeBuf strings.Builder
	
	for _, line := range lines {
		trimmed := strings.TrimSpace(line)
		
		if strings.HasPrefix(trimmed, "```") {
			if !inCode {
				inCode = true
				codeLang = strings.TrimPrefix(trimmed, "```")
				codeBuf.Reset()
			} else {
				inCode = false
				code := codeStyle.Render(codeBuf.String())
				result = append(result, fmt.Sprintf("```%s\n%s\n```", codeLang, code))
				codeLang = ""
			}
			continue
		}
		
		if inCode {
			codeBuf.WriteString(line + "\n")
			continue
		}
		
		if strings.HasPrefix(trimmed, "# ") {
			result = append(result, bold.Render(strings.TrimPrefix(trimmed, "# ")))
		} else if strings.HasPrefix(trimmed, "## ") {
			result = append(result, lipgloss.NewStyle().Bold(true).Foreground(accent).Render(strings.TrimPrefix(trimmed, "## ")))
		} else if strings.HasPrefix(trimmed, "- ") || strings.HasPrefix(trimmed, "* ") {
			result = append(result, fmt.Sprintf("  %s %s", dim.Render("•"), strings.TrimPrefix(trimmed, "- ")))
		} else if strings.HasPrefix(trimmed, "> ") {
			result = append(result, italic.Render(dim.Render(strings.TrimPrefix(trimmed, "> "))))
		} else if strings.Contains(line, "`") {
			result = append(result, t.renderInlineCode(line))
		} else {
			wrapped := wordwrap.String(line, t.width-4)
			result = append(result, wrapped)
		}
	}
	
	return strings.Join(result, "\n")
}

func (t *Terminal) renderInlineCode(text string) string {
	var result strings.Builder
	parts := strings.Split(text, "`")
	for i, part := range parts {
		if i%2 == 1 {
			result.WriteString(codeStyle.Render(part))
		} else {
			result.WriteString(part)
		}
	}
	return result.String()
}

func PrintLogo() {
	logo := `
╔══════════════════════════════════════╗
║   ████████  ██████  ██    ██ ███████ ║
║      ██    ██    ██ ██    ██ ██      ║
║      ██    ██    ██ ██    ██ █████   ║
║      ██    ██    ██  ██  ██  ██      ║
║      ██     ██████    ████   ███████ ║
║                                    ║
║      CLI Agent v1.0.0              ║
╚══════════════════════════════════════╝`
	
	style := lipgloss.NewStyle().
		Foreground(accent).
		Bold(true).
		Border(lipgloss.DoubleBorder()).
		BorderForeground(accent).
		Padding(0, 1)
	
	fmt.Println(style.Render(logo))
	fmt.Println()
}

func successColor(s string) string {
	return lipgloss.NewStyle().Foreground(success).Bold(true).Render(s)
}

func errorColor(s string) string {
	return lipgloss.NewStyle().Foreground(errorColor).Bold(true).Render(s)
}

type StatusMsg string
type TickMsg time.Time

func (t *Terminal) RunSpinner(ctx context.Context, msg string) tea.Cmd {
	return tea.Sequence(
		func() tea.Msg {
			return StatusMsg(msg)
		},
		tea.Tick(time.Millisecond*100, func(t time.Time) tea.Msg {
			return TickMsg(t)
		}),
	)
}